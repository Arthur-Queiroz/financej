import ExcelJS from 'exceljs'
import ptBR from '../locales/pt-BR.json'
import en from '../locales/en.json'

const translations = {
  'pt-BR': ptBR,
  'en': en
}

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { from, to, locale: queryLocale } = getQuery(event)

  if (!from || !to) {
    throw createError({ statusCode: 400, message: 'from and to query params are required' })
  }

  // Get locale from query or default to pt-BR
  const locale = (queryLocale as string) || 'pt-BR'
  const t = translations[locale as keyof typeof translations] || translations['pt-BR']

  const fromDate = new Date(from as string)
  const toDate = new Date(`${to}T23:59:59.999Z`)

  const [expenses, incomes] = await Promise.all([
    db.expense.findMany({
      where: { userId, date: { gte: fromDate, lte: toDate } },
      orderBy: { date: 'asc' }
    }),
    db.income.findMany({ where: { userId } })
  ])

  const totalIncome = prorateIncome(incomes, fromDate, toDate)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const balance = totalIncome - totalExpenses
  const spentPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Finance Manager'
  workbook.created = new Date()

  // Summary worksheet with styling
  const summary = workbook.addWorksheet(t.summary)
  summary.columns = [
    { header: t.metric, key: 'metric', width: 28 },
    { header: t.value, key: 'value', width: 18 }
  ]

  // Style header cells (only the 2 columns with data)
  summary.getRow(1).height = 25
  for (let col = 1; col <= 2; col++) {
    const cell = summary.getRow(1).getCell(col)
    cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B5563' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  }

  // Add data rows
  const summaryData = [
    { metric: t.totalIncome, value: totalIncome },
    { metric: t.totalExpenses, value: totalExpenses },
    { metric: t.balance, value: balance },
    { metric: t.spentPercent, value: spentPercentage }
  ]

  summaryData.forEach((row, index) => {
    const excelRow = summary.addRow(row)
    excelRow.getCell(2).numFmt = index === 3 ? '0.00"%"' : '#,##0.00'
    excelRow.font = { size: 11 }
    excelRow.alignment = { vertical: 'middle' }
    excelRow.height = 20

    // Color code the balance
    if (row.metric === t.balance) {
      excelRow.getCell(2).font = { bold: true, color: { argb: balance >= 0 ? 'FF10B981' : 'FFEF4444' } }
    }
  })

  // Add borders
  summary.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      }
    })
  })

  // Expenses worksheet with styling
  const sheet = workbook.addWorksheet(t.expenses)
  sheet.columns = [
    { header: t.date, key: 'date', width: 14 },
    { header: t.amount, key: 'amount', width: 16 },
    { header: t.category, key: 'category', width: 24 },
    { header: t.description, key: 'description', width: 45 }
  ]

  // Style header cells (only the 4 columns with data)
  sheet.getRow(1).height = 25
  for (let col = 1; col <= 4; col++) {
    const cell = sheet.getRow(1).getCell(col)
    cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4B5563' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  }

  // Add expense rows with styling
  expenses.forEach((expense, index) => {
    const row = sheet.addRow({
      date: expense.date.toLocaleDateString(locale),
      amount: Number(expense.amount),
      category: t.categories[expense.category as keyof typeof t.categories] || expense.category,
      description: expense.description ?? ''
    })

    // Format amount as currency
    row.getCell(2).numFmt = '#,##0.00'
    row.font = { size: 11 }
    row.alignment = { vertical: 'middle' }
    row.height = 20

    // Alternate row colors
    if (index % 2 === 1) {
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
    }
  })

  // Add borders to all cells
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      }
    })
  })

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  const dateStr = new Date().toISOString().split('T')[0]

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="expenses-${dateStr}.xlsx"`)

  return buffer
})
