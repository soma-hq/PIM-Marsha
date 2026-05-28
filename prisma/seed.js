const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const config = require("../src/config");

const prisma = new PrismaClient();

async function main() {
	const organizations = config.organizations;
	const users = config.users;
	const organizationMap = new Map();

	for (const organization of organizations) {
		const row = await prisma.organization.upsert({
			where: { name: organization.name },
			update: { logoKey: organization.logoKey },
			create: organization,
		});
		organizationMap.set(row.name, row.id);
	}

	for (const user of users) {
		const passwordHash = await bcrypt.hash(
			user.password,
			config.security.bcryptRounds,
		);
		const organizationId = user.organizationName
			? organizationMap.get(user.organizationName) || null
			: null;
		const role = user.role.toUpperCase();
		await prisma.user.upsert({
			where: { email: user.email },
			update: {
				name: user.name,
				firstName: user.firstName,
				lastName: user.lastName,
				organizationId,
				role,
			},
			create: {
				email: user.email,
				name: user.name,
				firstName: user.firstName,
				lastName: user.lastName,
				organizationId,
				role,
				passwordHash,
			},
		});
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
