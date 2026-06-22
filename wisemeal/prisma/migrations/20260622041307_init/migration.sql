-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "heightCm" REAL NOT NULL,
    "weightKg" REAL NOT NULL,
    "goalWeightKg" REAL NOT NULL,
    "activityLevel" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "allergies" TEXT NOT NULL DEFAULT '[]',
    "dietaryRestrictions" TEXT NOT NULL DEFAULT '[]',
    "dailyCalorieGoal" INTEGER NOT NULL,
    "proteinGoalG" REAL NOT NULL,
    "carbGoalG" REAL NOT NULL,
    "fatGoalG" REAL NOT NULL,
    "waterGoalMl" REAL NOT NULL DEFAULT 2000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FoodLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "brandName" TEXT,
    "amountG" REAL NOT NULL,
    "calories" REAL NOT NULL,
    "proteinG" REAL NOT NULL,
    "carbsG" REAL NOT NULL,
    "fatG" REAL NOT NULL,
    "fiberG" REAL NOT NULL DEFAULT 0,
    "sugarG" REAL NOT NULL DEFAULT 0,
    "sodiumMg" REAL NOT NULL DEFAULT 0,
    "cholesterolMg" REAL NOT NULL DEFAULT 0,
    "saturatedFatG" REAL NOT NULL DEFAULT 0,
    "transFatG" REAL NOT NULL DEFAULT 0,
    "vitaminAMcg" REAL NOT NULL DEFAULT 0,
    "vitaminCMg" REAL NOT NULL DEFAULT 0,
    "vitaminDMcg" REAL NOT NULL DEFAULT 0,
    "calciumMg" REAL NOT NULL DEFAULT 0,
    "ironMg" REAL NOT NULL DEFAULT 0,
    "potassiumMg" REAL NOT NULL DEFAULT 0,
    "allergens" TEXT NOT NULL DEFAULT '[]',
    "imageUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "ingredients" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "weightKg" REAL NOT NULL,
    "bmi" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeightLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "amountMl" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "steps" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StepLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "planData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ingredients" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "servings" INTEGER NOT NULL DEFAULT 1,
    "calories" REAL NOT NULL,
    "proteinG" REAL NOT NULL,
    "carbsG" REAL NOT NULL,
    "fatG" REAL NOT NULL,
    "fiberG" REAL NOT NULL DEFAULT 0,
    "prepTimeMin" INTEGER,
    "cookTimeMin" INTEGER,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "imageUrl" TEXT,
    "sourceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomFood" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandName" TEXT,
    "barcode" TEXT,
    "per100gCalories" REAL NOT NULL,
    "per100gProtein" REAL NOT NULL,
    "per100gCarbs" REAL NOT NULL,
    "per100gFat" REAL NOT NULL,
    "per100gFiber" REAL NOT NULL DEFAULT 0,
    "per100gSugar" REAL NOT NULL DEFAULT 0,
    "per100gSodium" REAL NOT NULL DEFAULT 0,
    "servingSizeG" REAL NOT NULL DEFAULT 100,
    "servingUnit" TEXT NOT NULL DEFAULT 'g',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomFood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "breakdown" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HealthScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "HealthScore_userId_date_key" ON "HealthScore"("userId", "date");
