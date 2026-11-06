const books = [
  { title: 'Laskar Pelangi', author: 'Andrea Hirata', year: 2005 },
  { title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', year: 1980 },
  { title: 'Negeri 5 Menara', author: 'Ahmad Fuadi', year: 2009 },
  { title: 'Perahu Kertas', author: 'Dee Lestari', year: 2009 },
  { title: 'Cantik Itu Luka', author: 'Eka Kurniawan', year: 2002 },
  { title: 'Filosofi Teras', author: 'Henry Manampiring', year: 2018 },
  { title: 'Rindu', author: 'Tere Liye', year: 2014 },
  { title: 'Hujan', author: 'Tere Liye', year: 2016 },
  { title: 'Pulang', author: 'Tere Liye', year: 2015 },
  { title: 'Bumi', author: 'Tere Liye', year: 2014 },
  { title: 'Bulan', author: 'Tere Liye', year: 2015 },
  { title: 'Matahari', author: 'Tere Liye', year: 2016 }
];

async function sendPostRequests() {
  for (const book of books) {
    const res = await fetch('http://localhost:3000/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    });
    const data = await res.json();
    console.log(`[POST 201] Berhasil menambah: ${data.data.title}`);
  }
}

sendPostRequests();