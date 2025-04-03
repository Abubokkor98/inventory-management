import { PrismaClient, Role, PRStatus, POStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.goodsReceivedItem.deleteMany();
  await prisma.goodsReceived.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.purchaseRequestItem.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.itemMaster.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('password', 10);
  const managerPassword = await bcrypt.hash('password', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+1234567890',
      role: Role.ADMIN,
      password: adminPassword,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Manager User',
      email: 'manager@example.com',
      phone: '+0987654321',
      role: Role.MANAGER,
      password: managerPassword,
    },
  });

  // Create items with stock
  const laptop = await prisma.itemMaster.create({
    data: {
      sku: 'LP001',
      name: 'Laptop',
      image: 'https://example.com/laptop.jpg',
      unit: 'pcs',
      price: 1200.0,
      stock: {
        create: {
          quantity: 10,
        },
      },
    },
  });

  const monitor = await prisma.itemMaster.create({
    data: {
      sku: 'MN002',
      name: '4K Monitor',
      image: 'https://example.com/monitor.jpg',
      unit: 'pcs',
      price: 400.0,
      stock: {
        create: {
          quantity: 25,
        },
      },
    },
  });

  // Create purchase request
  const pr = await prisma.purchaseRequest.create({
    data: {
      totalQty: 5,
      leftQty: 5,
      status: PRStatus.WAITING,
      totalPrice: 3600.0,
      items: {
        create: [
          {
            itemId: laptop.id,
            quantity: 2,
            leftQuantity: 2,
            price: 1200.0,
          },
          {
            itemId: monitor.id,
            quantity: 3,
            leftQuantity: 3,
            price: 400.0,
          },
        ],
      },
    },
  });

  // Create purchase order
  const po = await prisma.purchaseOrder.create({
    data: {
      totalQty: 5,
      remainingQty: 5,
      status: POStatus.WAITING,
      totalPrice: 3600.0,
      purchaseRequestId: pr.id,
      items: {
        create: [
          {
            itemId: laptop.id,
            quantity: 2,
            price: 1200.0,
            remainingQty: 2,
          },
          {
            itemId: monitor.id,
            quantity: 3,
            price: 400.0,
            remainingQty: 3,
          },
        ],
      },
    },
  });

  // Create goods received
  const gr = await prisma.goodsReceived.create({
    data: {
      purchaseOrderId: po.id,
      totalQty: 5,
      items: {
        create: [
          {
            itemId: laptop.id,
            quantity: 2,
          },
          {
            itemId: monitor.id,
            quantity: 3,
          },
        ],
      },
    },
  });

  // Update purchase order status to complete
  await prisma.purchaseOrder.update({
    where: { id: po.id },
    data: {
      remainingQty: 0,
      status: POStatus.COMPLETE,
    },
  });

  // Update purchase request status to complete
  await prisma.purchaseRequest.update({
    where: { id: pr.id },
    data: {
      leftQty: 0,
      status: PRStatus.COMPLETE,
    },
  });

  console.log('Database seeded successfully!');
  console.log({
    admin: { email: admin.email, password: 'password' },
    manager: { email: manager.email, password: 'password' },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });