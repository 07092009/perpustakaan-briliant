const express = require("express");
const db = require("./db");
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors())

app.get("/", (req, res) => {
  res.send("Server Perpustakaan Berjalan!");
});

// Menampilkan seluruh data buku
app.get("/buku", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, k.nama_kategori
      FROM buku AS b
      LEFT JOIN kategori_buku AS k ON k.id_kategori = b.id_kategori
      ORDER BY b.id_buku
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data buku" });
  }
});

// Mengambil data buku berdasarkan ID
app.get('/buku/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            'SELECT * FROM buku WHERE id_buku = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Buku tidak ditemukan'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server'
        });
    }
});

// Menambahkan data buku baru
app.post("/buku", async (req, res) => {
  try {
    const { id_kategori, judul_buku, penulis, penerbit, tahun_terbit, stok } =
      req.body;

    const result = await db.query(
      "INSERT INTO buku (id_kategori, judul_buku, penulis, penerbit, tahun_terbit, stok) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [id_kategori, judul_buku, penulis, penerbit, tahun_terbit, stok],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menambahkan buku" });
  }
});

// Mengubah data buku
app.put("/buku/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { judul_buku, penulis, penerbit, tahun_terbit, stok } = req.body;

    const result = await db.query(
      "UPDATE buku SET judul_buku = $1, penulis = $2, penerbit = $3, tahun_terbit = $4, stok = $5 WHERE id_buku = $6 RETURNING *",
      [judul_buku, penulis, penerbit, tahun_terbit, stok, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Buku tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengubah data buku" });
  }
});

// Menghapus data buku
app.delete("/buku/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM buku WHERE id_buku = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Buku tidak ditemukan",
      });
    }

    res.json({
      message: "Buku berhasil dihapus",
    });

  } catch (error) {
    console.error(error);

    if (error.code === "23503") {
      return res.status(409).json({
        error: "Buku tidak dapat dihapus karena memiliki riwayat peminjaman.",
      });
    }

    res.status(500).json({
      error: "Gagal menghapus data buku",
    });
  }
});

// Menampilkan seluruh kategori buku
app.get("/kategori", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM kategori_buku ORDER BY id_kategori",
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil kategori" });
  }
});

// Menampilkan riwayat peminjaman buku
app.get("/peminjaman", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT p.id_peminjaman, b.judul_buku, p.nama_peminjam, p.kelas, p.tanggal_pinjam, p.tanggal_kembali, p.status FROM peminjaman AS p JOIN buku AS b ON p.id_buku = b.id_buku ORDER BY p.id_peminjaman DESC",
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil riwayat peminjaman" });
  }
});

// Menambahkan data peminjaman buku
app.post("/peminjaman", async (req, res) => {
  const { id_buku, nama_peminjam, kelas } = req.body;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Memeriksa buku dan stok
    const buku = await client.query(
      `SELECT stok FROM buku WHERE id_buku = $1 FOR UPDATE`,
      [id_buku],
    );

    if (buku.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Buku tidak ditemukan",
      });
    }

    if (buku.rows[0].stok <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Stok buku habis",
      });
    }

    // Memeriksa transaksi peminjaman
    const peminjaman = await client.query(
      `INSERT INTO peminjaman (id_buku, nama_peminjam, kelas, tanggal_pinjam, status) VALUES ($1, $2, $3, CURRENT_DATE, $4) RETURNING *`,
      [id_buku, nama_peminjam, kelas, "dipinjam"],
    );

    // Mengurangi stok buku
    await client.query("UPDATE buku SET stok = stok - 1 WHERE id_buku = $1", [
      id_buku,
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Peminjaman berhasil ditambahkan",
      data: peminjaman.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Gagal melakukan peminjaman" });
  } finally {
    client.release();
  }
});

app.post('/peminjaman/:id/kembali', async(req, res)=> {
  const {id}= req.params

  const client = await db.connect();

  try{
    await client.query('BEGIN')

    const data = await client.query(
      'SELECT * FROM peminjaman WHERE id_peminjaman = $1 FOR UPDATE', [id]
    );

    if (data.rows.length === 0) {
      await client.query ('ROLLBACK')

      return res.status(404).json({
        message: 'Data peminjaman tidak ditemukan'
      })
    }

    const pinjam = data.rows[0]

    if (pinjam.status !== 'dipinjam') {
      await client.query('ROLLBACK')
      return res.status(400).json({
        message: 'Buku sudah dikembalikan'
      })
    }

    await client.query(
      `UPDATE peminjaman SET status ='Dikembalikan', tanggal_kembali = CURRENT_DATE WHERE id_peminjaman = $1`, [id]
    )

    await client.query(
      `UPDATE buku SET stok = stok + 1 WHERE id_buku = $1`, [pinjam.id_buku]
    )

    await client.query('COMMIT')

    res.json({
      message: 'Buku berhasil dikembalikan'
    });
  } catch (error){
    await client.query('ROLLBACK');

    console.error(error);

    res.status(500).json({
      massage: 'Gagal mengembalikan buku'
    });
  } finally {
    client.release()
  }
})

app.listen(3000, () => {
  console.log("Server Berjalan di http://localhost:3000");
});
