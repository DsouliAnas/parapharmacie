import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";

const subcategoryData: Record<string, string[]> = {
  Visage: [
    "Nettoyants",
    "Démaquillants",
    "Hydratants",
    "Sérums",
    "Masques",
    "Contour des yeux",
    "Soins anti-âge",
  ],

  Cheveux: [
    "Shampoings",
    "Après-shampoings",
    "Masques cheveux",
    "Huiles capillaires",
    "Soins anti-chute",
    "Soins du cuir chevelu",
  ],

  Corps: [
    "Gels douche",
    "Laits corporels",
    "Hydratants corps",
    "Déodorants",
    "Soins des mains",
    "Soins des pieds",
    "Gommages corps",
    "Huiles corps",
    "Crèmes mains",
  ],

  Bébé: [
    "Hygiène bébé",
    "Soins bébé",
    "Shampooings bébé",
    "Laits bébé",
    "Couches & change",
    "Lingettes",
    "Crèmes pour le change",
    "Soins cheveux bébé",
  ],

  "Compléments alimentaires": [
    "Vitamines",
    "Minéraux",
    "Immunité",
    "Énergie",
    "Digestion",
    "Cheveux & ongles",
    "Sommeil",
    "Articulations",
    "Probiotiques",
  ],

  Solaire: [
    "Protection solaire visage",
    "Protection solaire corps",
    "Après-soleil",
    "Autobronzants",
    "Protection solaire enfant",
  ],

  Hygiène: [
    "Hygiène bucco-dentaire",
    "Hygiène intime",
    "Mouchoirs",
    "Désinfection",
    "Lavage des mains",
    "Coton & accessoires",
  ],

  "Matériel médical": [
    "Thermomètres",
    "Tensiomètres",
    "Pansements",
    "Bandages",
    "Accessoires médicaux",
    "Orthopédie",
    "Matériel de soins",
  ],

  Homme: [
    "Soins visage homme",
    "Rasage",
    "Soins barbe",
    "Déodorants homme",
    "Soins corps homme",
    "Shampoings homme",
    "Parfums homme",
  ],

  Femme: [
    "Soins visage femme",
    "Hygiène intime",
    "Soins corps femme",
    "Déodorants femme",
    "Soins capillaires femme",
    "Maternité",
    "Parfums femme",
  ],
};

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST() {
  try {
    await connectDB();

    const categories = await Category.find();

    if (categories.length === 0) {
      return Response.json(
        {
          error: "No categories found",
        },
        {
          status: 400,
        }
      );
    }

    let created = 0;
    let skipped = 0;

    for (const category of categories) {
      const subcategories =
        subcategoryData[category.name];

      if (!subcategories) {
        continue;
      }

      for (const name of subcategories) {
        const slug = createSlug(name);

        const exists =
          await Subcategory.findOne({
            category: category._id,
            slug,
          });

        if (exists) {
          skipped++;
          continue;
        }

        await Subcategory.create({
          name,
          slug,
          category: category._id,
          image: "",
        });

        created++;
      }
    }

    return Response.json({
      message:
        "Subcategories seeded successfully",
      created,
      skipped,
    });
  } catch (error) {
    console.error(
      "SEED SUBCATEGORIES ERROR:",
      error
    );

    return Response.json(
      {
        error: "Failed to seed subcategories",
      },
      {
        status: 500,
      }
    );
  }
}