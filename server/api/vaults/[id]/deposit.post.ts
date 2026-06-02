export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const vaultId = getRouterParam(event, 'id')!
  const { amount, note, date } = await readBody(event)

  if (!amount || !date) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const vault = await db.vault.findFirst({ where: { id: vaultId, userId } })
  if (!vault) throw createError({ statusCode: 404, message: 'Vault not found' })

  const [deposit] = await db.$transaction([
    db.vaultDeposit.create({
      data: {
        vaultId,
        amount: Number(amount),
        direction: 'IN',
        note: note || null,
        date: new Date(date)
      }
    }),
    db.expense.create({
      data: {
        amount: Number(amount),
        category: 'INVESTMENT',
        description: `Caixinha: ${vault.name}`,
        date: new Date(date),
        userId
      }
    })
  ])

  setResponseStatus(event, 201)
  return deposit
})
