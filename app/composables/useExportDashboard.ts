import type { ClientExpense } from '~/composables/useExpenses'
import { fmtBRL } from '~/utils/format'

interface CategoryBreakdown {
  category: string
  amount: number
  percentageOfIncome: number
}

interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  spentPercentage: number
  byCategory: CategoryBreakdown[]
}

export const useExportDashboard = () => {
  const { t } = useI18n()
  const toast = useToast()

  const TEXT_COLOR = [17, 24, 39] as const
  const GRAY_COLOR = [107, 114, 128] as const
  const NEGATIVE_COLOR = [239, 68, 68] as const
  const POSITIVE_COLOR = [16, 185, 129] as const // Green for balance

  // Chart colors palette (distinct colors for pie chart)
  const CHART_COLORS: [number, number, number][] = [
    [37, 99, 235], // Blue
    [16, 185, 129], // Green
    [245, 158, 11], // Amber
    [239, 68, 68], // Red
    [139, 92, 246], // Purple
    [236, 72, 153], // Pink
    [6, 182, 212], // Cyan
    [251, 146, 60], // Orange
    [34, 197, 94], // Light Green
    [168, 85, 247] // Violet
  ]

  async function exportDashboardToPDF(
    summary: DashboardSummary | null,
    expenses: ClientExpense[] | null,
    periodLabel: string,
    dateRange: { from: string, to: string }
  ) {
    try {
      // Show loading toast
      const loadingToast = toast.add({
        title: t('dashboard.generating_pdf', 'Gerando PDF...'),
        description: t('dashboard.creating_report', 'Criando relatório'),
        color: 'neutral',
        duration: 0
      })

      // Loaded on demand: jsPDF is browser-only and heavy (~400 kB), so we keep it
      // out of the SSR bundle and the main client chunk and import it lazily here.
      const { default: jsPDF } = await import('jspdf')

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 20
      let yPos = margin

      // Title
      pdf.setFontSize(24)
      pdf.setTextColor(...TEXT_COLOR)
      pdf.text(t('dashboard.financial_report', 'Relatório Financeiro'), margin, yPos)
      yPos += 8

      // Period and date
      pdf.setFontSize(10)
      pdf.setTextColor(...GRAY_COLOR)
      pdf.text(`${periodLabel} • ${dateRange.from} — ${dateRange.to}`, margin, yPos)
      yPos += 12

      // Summary Section
      if (summary) {
        pdf.setFontSize(10)
        pdf.setTextColor(...GRAY_COLOR)
        pdf.text(t('dashboard.balance', 'Saldo'), margin, yPos)
        yPos += 10

        // Balance value (always green to represent balance)
        pdf.setFontSize(28)
        pdf.setTextColor(...POSITIVE_COLOR)
        pdf.text(fmtBRL(summary.balance), margin, yPos)
        yPos += 12

        // Income and Expenses
        pdf.setFontSize(10)
        const col1X = margin
        const col2X = margin + 60
        const col3X = margin + 120

        // Income
        pdf.setTextColor(...GRAY_COLOR)
        pdf.text(t('dashboard.income', 'Receitas'), col1X, yPos)
        pdf.setTextColor(...TEXT_COLOR)
        pdf.text(fmtBRL(summary.totalIncome), col1X, yPos + 5)

        // Expenses
        pdf.setTextColor(...GRAY_COLOR)
        pdf.text(t('dashboard.expenses', 'Despesas'), col2X, yPos)
        pdf.setTextColor(...NEGATIVE_COLOR)
        pdf.text(`-${fmtBRL(summary.totalExpenses).replace('R$ ', '')}`, col2X, yPos + 5)

        // Entries count
        const entriesCount = expenses?.length ?? 0
        pdf.setTextColor(...GRAY_COLOR)
        pdf.text(`${entriesCount} ${t('dashboard.entries', 'lançamentos')}`, col3X, yPos)
        pdf.setTextColor(...TEXT_COLOR)
        const avg = summary.totalExpenses / Math.max(entriesCount, 1)
        pdf.text(t('dashboard.average', 'Média') + ' ' + fmtBRL(avg), col3X, yPos + 5)

        yPos += 15
      }

      yPos += 5

      // Category Breakdown
      if (summary?.byCategory && summary.byCategory.length > 0) {
        pdf.setFontSize(14)
        pdf.setTextColor(...TEXT_COLOR)
        pdf.text(t('dashboard.by_category', 'Gastos por Categoria'), margin, yPos)
        yPos += 8

        // Sort categories by amount
        const sortedCategories = [...summary.byCategory].sort((a, b) => b.amount - a.amount)

        // Draw donut chart with colored segments
        const chartCenterX = margin + 25
        const chartCenterY = yPos + 25
        const chartRadius = 22
        const innerRadius = 13
        let currentAngle = -Math.PI / 2

        // Draw each segment with different color
        sortedCategories.forEach((cat, idx) => {
          const percentage = (cat.amount / summary.totalExpenses) * 100
          const sliceAngle = (percentage / 100) * 2 * Math.PI
          const color = CHART_COLORS[idx % CHART_COLORS.length]!

          // Draw filled segment using multiple small triangles
          pdf.setFillColor(...color)

          const steps = Math.max(20, Math.ceil(sliceAngle * 50)) // More steps for larger slices
          for (let i = 0; i < steps; i++) {
            const angle1 = currentAngle + (sliceAngle * i / steps)
            const angle2 = currentAngle + (sliceAngle * (i + 1) / steps)

            // Outer points
            const x1 = chartCenterX + Math.cos(angle1) * chartRadius
            const y1 = chartCenterY + Math.sin(angle1) * chartRadius
            const x2 = chartCenterX + Math.cos(angle2) * chartRadius
            const y2 = chartCenterY + Math.sin(angle2) * chartRadius

            // Inner points
            const x3 = chartCenterX + Math.cos(angle1) * innerRadius
            const y3 = chartCenterY + Math.sin(angle1) * innerRadius
            const x4 = chartCenterX + Math.cos(angle2) * innerRadius
            const y4 = chartCenterY + Math.sin(angle2) * innerRadius

            // Draw quad as two triangles
            pdf.setFillColor(...color)
            pdf.lines([[x2 - x1, y2 - y1], [x3 - x2, y3 - y2], [x1 - x3, y1 - y3]], x1, y1, [1, 1], 'F')
            pdf.lines([[x4 - x2, y4 - y2], [x3 - x4, y3 - y4], [x2 - x3, y2 - y3]], x2, y2, [1, 1], 'F')
          }

          currentAngle += sliceAngle
        })

        // Draw white inner circle for donut effect
        pdf.setFillColor(255, 255, 255)
        pdf.circle(chartCenterX, chartCenterY, innerRadius, 'F')

        // Total in center
        pdf.setFontSize(8)
        pdf.setTextColor(...GRAY_COLOR)
        pdf.text(t('dashboard.total', 'Total'), chartCenterX, chartCenterY - 2.5, { align: 'center' })
        pdf.setFontSize(10)
        pdf.setTextColor(...TEXT_COLOR)
        pdf.text(fmtBRL(summary.totalExpenses, { compact: true }), chartCenterX, chartCenterY + 2.5, { align: 'center' })

        // Category bars on the right (aligned with chart center)
        const totalBarsHeight = sortedCategories.length * 6
        let barYPos = chartCenterY - (totalBarsHeight / 2) + 3
        const barsStartX = margin + 60

        sortedCategories.forEach((cat, idx) => {
          const percentage = (cat.amount / summary.totalExpenses) * 100
          const color = CHART_COLORS[idx % CHART_COLORS.length]!

          // Check if need new page
          if (barYPos > 275) {
            pdf.addPage()
            barYPos = margin
          }

          // Color indicator square
          pdf.setFillColor(...color)
          pdf.rect(barsStartX - 5, barYPos - 3, 3, 3, 'F')

          // Category name
          pdf.setFontSize(9)
          pdf.setTextColor(...TEXT_COLOR)
          pdf.text(t(`categories.${cat.category}`, cat.category), barsStartX + 1, barYPos)

          // Amount
          pdf.setFontSize(8)
          pdf.setTextColor(...GRAY_COLOR)
          const amountText = fmtBRL(cat.amount, { compact: true })
          pdf.text(amountText, barsStartX + 41, barYPos)

          // Percentage bar
          const barWidth = 50
          const barHeight = 3
          const filledWidth = (percentage / 100) * barWidth

          pdf.setFillColor(229, 231, 235)
          pdf.rect(barsStartX + 66, barYPos - 2.5, barWidth, barHeight, 'F')

          pdf.setFillColor(...color)
          pdf.rect(barsStartX + 66, barYPos - 2.5, filledWidth, barHeight, 'F')

          // Percentage text
          pdf.setFontSize(8)
          pdf.setTextColor(...GRAY_COLOR)
          pdf.text(`${percentage.toFixed(1)}%`, barsStartX + 119, barYPos)

          barYPos += 6
        })

        yPos = Math.max(chartCenterY + chartRadius + 10, barYPos + 5)
      }

      // Recent Expenses
      if (expenses && expenses.length > 0) {
        if (yPos > 220) {
          pdf.addPage()
          yPos = margin
        }

        pdf.setFontSize(14)
        pdf.setTextColor(...TEXT_COLOR)
        pdf.text(t('dashboard.recent', 'Despesas Recentes'), margin, yPos)
        yPos += 8

        // Show all expenses (not just 10)
        expenses.forEach((exp, idx) => {
          const expDate = new Date(exp.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
          })

          // Date
          pdf.setFontSize(9)
          pdf.setTextColor(...GRAY_COLOR)
          pdf.text(expDate, margin + 5, yPos)

          // Description
          pdf.setFontSize(10)
          pdf.setTextColor(...TEXT_COLOR)
          const desc = exp.description || t(`categories.${exp.category}`)
          const truncDesc = desc.length > 30 ? desc.substring(0, 27) + '...' : desc
          pdf.text(truncDesc, margin + 25, yPos)

          // Category
          pdf.setFontSize(9)
          pdf.setTextColor(...GRAY_COLOR)
          pdf.text(t(`categories.${exp.category}`, exp.category), margin + 100, yPos)

          // Amount
          pdf.setFontSize(10)
          pdf.setTextColor(...NEGATIVE_COLOR)
          pdf.text(`-${fmtBRL(Number(exp.amount)).replace('R$ ', '')}`, margin + 150, yPos)

          yPos += 7

          // Page break if needed
          if (yPos > 275 && idx < expenses.length - 1) {
            pdf.addPage()
            yPos = margin

            // Repeat section title on new page
            pdf.setFontSize(14)
            pdf.setTextColor(...TEXT_COLOR)
            pdf.text(t('dashboard.recent', 'Despesas Recentes') + ' (cont.)', margin, yPos)
            yPos += 8
          }
        })
      }

      // Footer
      const pageCount = pdf.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(...GRAY_COLOR)
        const footerText = `${t('dashboard.page', 'Página')} ${i} ${t('dashboard.of', 'de')} ${pageCount}`
        pdf.text(footerText, pageWidth / 2, 287, { align: 'center' })
        const dateText = new Date().toLocaleDateString('pt-BR')
        pdf.text(dateText, pageWidth - margin, 287, { align: 'right' })
      }

      // Generate filename
      const date = new Date().toISOString().split('T')[0]
      const filePrefix = t('dashboard.report_filename', 'relatorio')
      const filename = `${filePrefix}-${periodLabel.toLowerCase().replace(/\s/g, '-')}-${date}.pdf`

      // Save PDF
      pdf.save(filename)

      // Remove loading toast and show success
      toast.remove(loadingToast.id)
      toast.add({
        title: 'PDF gerado com sucesso!',
        description: `Arquivo ${filename} baixado`,
        color: 'success'
      })
    } catch (error) {
      console.error('Error exporting dashboard to PDF:', error)
      toast.add({
        title: 'Erro ao gerar PDF',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        color: 'error'
      })
    }
  }

  return {
    exportDashboardToPDF
  }
}
