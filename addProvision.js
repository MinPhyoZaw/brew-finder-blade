import { doc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db } from ".src/config/firebase.ts"; // adjust path to your firebase config

async function addProvisionToCoffeeShops() {
  const coffeeShopsRef = collection(db, "coffeeshops");
  const snapshot = await getDocs(coffeeShopsRef);

  const provisions = [
    "Sanchaung",
    "Kamayut",
    "Insein",
    "Bahan",
    "Hlaing",
    "Dagon",
    "Mayangone",
    "Latha",
    "Kyauktada",
    "Tamwe"
  ];

  let i = 0;
  snapshot.forEach(async (docSnap) => {
    const provision = provisions[i % provisions.length]; // cycle provisions if more than 10 shops
    await updateDoc(docSnap.ref, { provision });
    i++;
  });

  console.log("Provision field added to all coffee shops!");
}

addProvisionToCoffeeShops();
