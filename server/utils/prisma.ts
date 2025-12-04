import { PrismaClient } from '@prisma/client'

// CORREÇÃO: Usamos 'prismaGlobal' aqui para evitar conflito de nome com a variável 'prisma' abaixo
declare global {
  var prismaGlobal: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // Em produção, cria uma nova instância limpa
  prisma = new PrismaClient()
} else {
  // Em desenvolvimento (local), verifica se já existe a global para não abrir conexões demais
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient()
  }
  prisma = global.prismaGlobal
}

export { prisma }