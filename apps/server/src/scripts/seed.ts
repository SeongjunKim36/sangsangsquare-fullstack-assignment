import { DataSource } from "typeorm";
import { createTypeOrmOptions } from "../config/typeorm.config";
import { MeetingCategory, User, UserRole } from "../entity";
import * as bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting database seeding...");

  const options = createTypeOrmOptions();
  const dataSource = new DataSource(options);

  try {
    await dataSource.initialize();
    console.log("✅ Database connection established");

    // Seed MeetingCategories
    await seedMeetingCategories(dataSource);

    // Seed Users (admin, test users)
    await seedUsers(dataSource);

    console.log("\n✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

async function seedMeetingCategories(dataSource: DataSource) {
  const categoryRepository = dataSource.getRepository(MeetingCategory);

  const categories = [
    { key: "BOOK", label: "독서", sortOrder: 1 },
    { key: "EXERCISE", label: "운동", sortOrder: 2 },
    { key: "RECORD", label: "기록", sortOrder: 3 },
    { key: "ENGLISH", label: "영어", sortOrder: 4 },
  ];

  console.log("\n📚 Seeding MeetingCategories...");

  for (const categoryData of categories) {
    const existing = await categoryRepository.findOne({
      where: { key: categoryData.key },
    });

    if (existing) {
      console.log(`⏭️  Category already exists: ${categoryData.key} (${categoryData.label})`);
    } else {
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);
      console.log(`✅ Created category: ${categoryData.key} (${categoryData.label})`);
    }
  }
}

async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const users = [
    {
      userId: "admin",
      name: "관리자",
      password: "admin123",
      role: UserRole.ADMIN,
    },
    {
      userId: "user1",
      name: "테스트유저1",
      password: "user123",
      role: UserRole.USER,
    },
    {
      userId: "user2",
      name: "테스트유저2",
      password: "user123",
      role: UserRole.USER,
    },
    {
      userId: "user3",
      name: "테스트유저3",
      password: "user123",
      role: UserRole.USER,
    },
  ];

  console.log("\n👥 Seeding Users...");

  for (const userData of users) {
    const existing = await userRepository.findOne({
      where: { userId: userData.userId },
    });

    if (existing) {
      console.log(`⏭️  User already exists: ${userData.userId} (${userData.name})`);
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = userRepository.create({
        userId: userData.userId,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
      });
      await userRepository.save(user);
      console.log(`✅ Created user: ${userData.userId} (${userData.name}, role: ${userData.role})`);
    }
  }
}

void seed();
