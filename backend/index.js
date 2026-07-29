const app = require("./app");
const prisma = require("./utils/prisma");

const PORT = process.env.PORT || 8000;

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ Neon Database Connected");
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);
    process.exit(1);
  }
}

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server Running On Port ${PORT}`);
});