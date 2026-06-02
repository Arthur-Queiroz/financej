export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const vaultId = getRouterParam(event, 'id')!
  const depositId = getRouterParam(event, 'depositId')!

  const vault = await db.vault.findFirst({ where: { id: vaultId, userId } })
  if (!vault) throw createError({ statusCode: 404, message: 'Vault not found' })

  const deposit = await db.vaultDeposit.findFirst({ where: { id: depositId, vaultId } })
  if (!deposit) throw createError({ statusCode: 404, message: 'Deposit not found' })

  await db.vaultDeposit.delete({ where: { id: depositId } })
  return { success: true }
})
