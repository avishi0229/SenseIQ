const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with quiet spaces in India...');

  // Quiet spaces in major Indian cities
  const quietSpaces = [
    // Delhi
    { latitude: 28.6139, longitude: 77.2090, name: 'Lodhi Garden', type: 'Park', avgNoise: 3, avgLight: 4, avgCrowd: 4, description: 'Historic park with beautiful gardens and monuments' },
    { latitude: 28.5244, longitude: 77.1855, name: 'Nehru Place Library', type: 'Library', avgNoise: 2, avgLight: 5, avgCrowd: 3, description: 'Quiet library in South Delhi' },
    { latitude: 28.5355, longitude: 77.2500, name: 'Sunder Nursery', type: 'Park', avgNoise: 2, avgLight: 4, avgCrowd: 3, description: 'Heritage park near Humayun\'s Tomb' },
    
    // Mumbai
    { latitude: 19.0144, longitude: 72.8479, name: 'Hanging Gardens', type: 'Park', avgNoise: 3, avgLight: 5, avgCrowd: 4, description: 'Terraced gardens on Malabar Hill' },
    { latitude: 18.9388, longitude: 72.8356, name: 'Asiatic Society Library', type: 'Library', avgNoise: 2, avgLight: 4, avgCrowd: 2, description: 'Historic library in Fort area' },
    { latitude: 19.1176, longitude: 72.9060, name: 'Sanjay Gandhi National Park', type: 'Park', avgNoise: 2, avgLight: 3, avgCrowd: 3, description: 'Large national park with greenery' },
    
    // Bangalore
    { latitude: 12.9716, longitude: 77.5946, name: 'Cubbon Park', type: 'Park', avgNoise: 3, avgLight: 4, avgCrowd: 5, description: 'Large public park in heart of city' },
    { latitude: 12.9597, longitude: 77.6364, name: 'Ulsoor Lake', type: 'Park', avgNoise: 3, avgLight: 5, avgCrowd: 4, description: 'Peaceful lake with walking paths' },
    { latitude: 12.9352, longitude: 77.6245, name: 'State Central Library', type: 'Library', avgNoise: 2, avgLight: 4, avgCrowd: 3, description: 'Large state library' },
    
    // Hyderabad
    { latitude: 17.4126, longitude: 78.4439, name: 'Lumbini Park', type: 'Park', avgNoise: 4, avgLight: 5, avgCrowd: 5, description: 'Park near Hussain Sagar Lake' },
    { latitude: 17.4239, longitude: 78.4738, name: 'KBR National Park', type: 'Park', avgNoise: 2, avgLight: 3, avgCrowd: 3, description: 'Forest park in Jubilee Hills' },
    { latitude: 17.4435, longitude: 78.3772, name: 'Botanical Garden', type: 'Park', avgNoise: 2, avgLight: 4, avgCrowd: 3, description: 'Serene botanical garden' },
    
    // Chennai
    { latitude: 13.0358, longitude: 80.2508, name: 'Theosophical Society', type: 'Park', avgNoise: 2, avgLight: 3, avgCrowd: 2, description: 'Peaceful wooded area in Adyar' },
    { latitude: 13.0475, longitude: 80.2824, name: 'Connemara Public Library', type: 'Library', avgNoise: 2, avgLight: 4, avgCrowd: 3, description: 'Heritage library building' },
    { latitude: 13.0067, longitude: 80.2206, name: 'Guindy National Park', type: 'Park', avgNoise: 2, avgLight: 3, avgCrowd: 3, description: 'One of few national parks in city' },
    
    // Pune
    { latitude: 18.5074, longitude: 73.8077, name: 'Osho Garden', type: 'Park', avgNoise: 2, avgLight: 4, avgCrowd: 3, description: 'Meditation garden' },
    { latitude: 18.5204, longitude: 73.8567, name: 'Saras Baug', type: 'Park', avgNoise: 3, avgLight: 4, avgCrowd: 4, description: 'Popular city garden' },
    
    // Kolkata
    { latitude: 22.5448, longitude: 88.3426, name: 'Victoria Memorial Gardens', type: 'Park', avgNoise: 4, avgLight: 5, avgCrowd: 5, description: 'Historic memorial with gardens' },
    { latitude: 22.5726, longitude: 88.3639, name: 'Rabindra Sarobar', type: 'Park', avgNoise: 3, avgLight: 4, avgCrowd: 4, description: 'Large lake and park' },
    { latitude: 22.5464, longitude: 88.3528, name: 'National Library', type: 'Library', avgNoise: 2, avgLight: 4, avgCrowd: 3, description: 'India\'s largest library' },
  ];

  for (const space of quietSpaces) {
    await prisma.quietSpace.create({
      data: space
    });
  }

  console.log('✅ Created', quietSpaces.length, 'quiet spaces');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
