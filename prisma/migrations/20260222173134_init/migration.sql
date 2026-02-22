-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensoryProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noiseSensitivity" INTEGER NOT NULL DEFAULT 5,
    "lightSensitivity" INTEGER NOT NULL DEFAULT 5,
    "crowdTolerance" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensoryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationTag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "placeName" TEXT,
    "noiseLevel" INTEGER NOT NULL,
    "lightingLevel" INTEGER NOT NULL,
    "crowdDensity" INTEGER NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "placeName" TEXT,
    "timeSlot" TEXT NOT NULL,
    "avgNoise" DOUBLE PRECISION NOT NULL,
    "avgLight" DOUBLE PRECISION NOT NULL,
    "avgCrowd" DOUBLE PRECISION NOT NULL,
    "ratingCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AggregatedData" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "placeName" TEXT,
    "timeSlot" TEXT NOT NULL,
    "avgNoise" DOUBLE PRECISION NOT NULL,
    "avgLight" DOUBLE PRECISION NOT NULL,
    "avgCrowd" DOUBLE PRECISION NOT NULL,
    "trafficLevel" DOUBLE PRECISION,
    "eventDensity" DOUBLE PRECISION,
    "sliScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "zoneType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AggregatedData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originLat" DOUBLE PRECISION NOT NULL,
    "originLng" DOUBLE PRECISION NOT NULL,
    "originName" TEXT,
    "destinationLat" DOUBLE PRECISION NOT NULL,
    "destinationLng" DOUBLE PRECISION NOT NULL,
    "destinationName" TEXT,
    "routePath" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "avgSliScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "routeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "placeName" TEXT NOT NULL,
    "bestHours" TEXT NOT NULL,
    "bestTimeSlot" TEXT NOT NULL,
    "avgSliScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "triggerReason" TEXT,
    "currentSliScore" DOUBLE PRECISION,
    "suggestedSpaces" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuietSpace" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "avgNoise" DOUBLE PRECISION NOT NULL,
    "avgLight" DOUBLE PRECISION NOT NULL,
    "avgCrowd" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuietSpace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SensoryProfile_userId_key" ON "SensoryProfile"("userId");

-- CreateIndex
CREATE INDEX "SensoryProfile_userId_idx" ON "SensoryProfile"("userId");

-- CreateIndex
CREATE INDEX "LocationTag_latitude_longitude_idx" ON "LocationTag"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "LocationTag_userId_idx" ON "LocationTag"("userId");

-- CreateIndex
CREATE INDEX "LocationTag_timeOfDay_idx" ON "LocationTag"("timeOfDay");

-- CreateIndex
CREATE INDEX "CommunityRating_latitude_longitude_idx" ON "CommunityRating"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "CommunityRating_timeSlot_idx" ON "CommunityRating"("timeSlot");

-- CreateIndex
CREATE INDEX "AggregatedData_latitude_longitude_idx" ON "AggregatedData"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "AggregatedData_timeSlot_idx" ON "AggregatedData"("timeSlot");

-- CreateIndex
CREATE INDEX "AggregatedData_riskLevel_idx" ON "AggregatedData"("riskLevel");

-- CreateIndex
CREATE INDEX "Route_userId_idx" ON "Route"("userId");

-- CreateIndex
CREATE INDEX "Route_createdAt_idx" ON "Route"("createdAt");

-- CreateIndex
CREATE INDEX "Recommendation_latitude_longitude_idx" ON "Recommendation"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "EmergencyLog_userId_idx" ON "EmergencyLog"("userId");

-- CreateIndex
CREATE INDEX "EmergencyLog_triggeredAt_idx" ON "EmergencyLog"("triggeredAt");

-- CreateIndex
CREATE INDEX "QuietSpace_latitude_longitude_idx" ON "QuietSpace"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "QuietSpace_type_idx" ON "QuietSpace"("type");

-- AddForeignKey
ALTER TABLE "SensoryProfile" ADD CONSTRAINT "SensoryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationTag" ADD CONSTRAINT "LocationTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityRating" ADD CONSTRAINT "CommunityRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyLog" ADD CONSTRAINT "EmergencyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
