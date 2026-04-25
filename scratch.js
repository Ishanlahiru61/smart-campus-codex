const { MongoClient } = require('mongodb');
async function run() {
  const uri = "mongodb+srv://ishan:ishan%401234@cluster4.n226at2.mongodb.net/SmartCampusDB?appName=Cluster4";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('SmartCampusDB');
    const facilities = await db.collection('facilities').find({}).toArray();
    facilities.forEach(f => {
      console.log(`Facility: ${f.name}`);
      console.log(`Windows: ${JSON.stringify(f.availabilityWindows)}`);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
