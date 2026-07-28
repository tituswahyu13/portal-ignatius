import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const password = "dansospar2026";
  
  const role = await prisma.role.findFirst({
    where: {
      OR: [
        { name: "Ketua Lingkungan" },
        { name: "PENGURUS_LINGKUNGAN" }
      ]
    }
  });

  if (!role) {
    throw new Error("Role 'Ketua Lingkungan' not found");
  }

  const lingkungans = await prisma.lingkungan.findMany();
  
  console.log(`Found ${lingkungans.length} lingkungan. Starting account creation...`);

  let count = 0;
  for (const ling of lingkungans) {
    const sanitizedName = ling.namaLingkungan.toLowerCase().replace(/[^a-z0-9]/g, "");
    const email = `lingkungan.${sanitizedName}@ignatius.id`;
    const name = `Ketua Lingkungan ${ling.namaLingkungan}`;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      if (authError.message.includes("User already registered") || authError.message.includes("already exists")) {
        console.log(`[SKIP] Account for ${ling.namaLingkungan} already exists in Supabase (${email})`);
        continue;
      }
      console.error(`Error creating auth for ${ling.namaLingkungan}:`, authError);
      continue;
    }

    const supabaseUserId = authData.user.id;

    try {
      await prisma.user.create({
        data: {
          id: BigInt(Date.now() + count),
          name,
          email,
          authId: supabaseUserId,
          isActive: true,
          lingkunganId: ling.id,
          userRoles: {
            create: {
              roleId: role.id
            }
          }
        }
      });
      console.log(`[SUCCESS] Created account for ${ling.namaLingkungan} (${email})`);
      count++;
    } catch (dbError) {
      console.error(`Error saving user to Prisma for ${ling.namaLingkungan}:`, dbError);
      await supabase.auth.admin.deleteUser(supabaseUserId);
    }
  }

  console.log(`\nFinished creating ${count} new accounts.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
