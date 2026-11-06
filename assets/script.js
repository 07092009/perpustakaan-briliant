const API_URL = "http://localhost:3000";
let semuaBuku = [];

function filterBuku() {
  const kataKunci = document.getElementById("pencarian-buku").value.trim().toLowerCase();
  const kategori = document.getElementById("filter-kategori").value;
  const bukuHasil = semuaBuku.filter((item) => {
    const cocokKataKunci = [
      item.judul_buku,
      item.penulis,
      item.penerbit,
    ].some((nilai) => String(nilai ?? "").toLowerCase().includes(kataKunci));
    const cocokKategori =
      kategori === "" || String(item.id_kategori) === String(kategori);

    return cocokKataKunci && cocokKategori;
  });

  tampilkanDaftarBuku(bukuHasil);
}

async function muatKategori() {
  const filterKategori = document.getElementById("filter-kategori");

  try {
    const response = await fetch(`${API_URL}/kategori`);
    if (!response.ok) throw new Error("Gagal mengambil kategori");

    const kategori = await response.json();
    kategori.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id_kategori;
      option.textContent = item.nama_kategori;
      filterKategori.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
}

function tampilkanDaftarBuku(buku) {
  const tbody = document.getElementById("daftar-buku");
  tbody.innerHTML = "";

  if (buku.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center p-5 text-slate-400">
          Buku tidak ditemukan
        </td>
      </tr>
    `;
    return;
  }

  buku.forEach((item) => {
    const baris = document.createElement("tr");
    baris.className = "hover:bg-blue-50/50 transition-colors";

    const data = [
      item.id_buku,
      item.judul_buku,
      item.penulis,
      item.penerbit,
      item.tahun_terbit,
      item.nama_kategori,
      item.stok,
    ];

    data.forEach((nilai) => {
      const kolom = document.createElement("td");
      kolom.textContent = nilai ?? "-";
      kolom.className = "px-4 py-4 align-middle";
      baris.appendChild(kolom);
    });

    const kolomAksi = document.createElement("td");
    kolomAksi.className = "px-4 py-4 text-center";

    const tombolEdit = document.createElement("button");
    tombolEdit.textContent = "Edit";
    tombolEdit.className = "bg-blue-600 text-white px-3 py-1 rounded mr-2";
    tombolEdit.addEventListener("click", () => {
      window.location.href = `pages/edit-buku.html?id=${item.id_buku}`;
    });

    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";
    tombolHapus.className = "bg-red-600 text-white px-3 py-1 rounded";
    tombolHapus.addEventListener("click", () => hapusBuku(item.id_buku));

    kolomAksi.appendChild(tombolEdit);
    kolomAksi.appendChild(tombolHapus);
    baris.appendChild(kolomAksi);
    tbody.appendChild(baris);
  });
}

async function tampilBuku() {
  const tbody = document.getElementById("daftar-buku");

  try {
    const response = await fetch(`${API_URL}/buku`);

    if (!response.ok) {
      throw new Error("Gagal mengambil data buku");
    }

    semuaBuku = await response.json();
    filterBuku();
  } catch (error) {
    console.error(error);

    tbody.innerHTML = `
            <tr>
                <td colspan="8">Gagal memuat data buku</td>
            </tr>
        `;
  }
}


// Mengambil dan menghitung statistik perpustakaan
async function tampilStatistik() {
    try {
        // Mengambil data buku dan peminjaman
        const [responseBuku, responsePeminjaman] = await Promise.all([
            fetch(`${API_URL}/buku`),
            fetch(`${API_URL}/peminjaman`)
        ]);

        if (!responseBuku.ok || !responsePeminjaman.ok) {
            throw new Error('Gagal mengambil data statistik');
        }

        const buku = await responseBuku.json();
        const peminjaman = await responsePeminjaman.json();

        // Menghitung jumlah judul buku
        const totalBuku = buku.length;

        // Menghitung seluruh stok buku
        const totalStok = buku.reduce((total, item) => {
            return total + Number(item.stok || 0);
        }, 0);

        // Menghitung peminjaman yang masih aktif
        const totalPeminjaman = peminjaman.filter(item => {
            return String(item.status).trim().toLowerCase() === 'dipinjam';
        }).length;

        // Menampilkan hasil ke halaman HTML
        document.getElementById('total-buku').textContent = totalBuku;

        document.getElementById('total-stok').textContent = totalStok;

        document.getElementById('total-peminjaman').textContent = totalPeminjaman;

    } catch (error) {
        console.error(error);

        document.getElementById('total-buku').textContent = '-';
        document.getElementById('total-stok').textContent = '-';
        document.getElementById('total-peminjaman').textContent = '-';
    }
}


// Fungsi menghapus buku
async function hapusBuku(id) {
  const konfirmasi = confirm("Apakah kamu yakin ingin menghapus buku ini?");

  if (!konfirmasi) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/buku/${id}`, {
      method: "DELETE",
    });

    const hasil = await response.json();

    if (!response.ok) {
      throw new Error(hasil.error || "Gagal menghapus buku");
    }

    alert(hasil.message);

    tampilBuku();
    tampilStatistik();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}

document.getElementById("pencarian-buku").addEventListener("input", filterBuku);
document.getElementById("filter-kategori").addEventListener("change", filterBuku);

muatKategori();
tampilBuku();
tampilStatistik();