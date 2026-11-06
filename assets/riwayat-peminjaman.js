const API_URL = "http://localhost:3000";

// Mengambil data riwayat peminjaman
async function tampilRiwayat() {
  const tbody = document.getElementById("daftar-peminjaman");

  try {
    const response = await fetch(`${API_URL}/peminjaman`);

    if (!response.ok) {
      throw new Error("Gagal mengambil riwayat peminjaman");
    }

    const peminjaman = await response.json();

    tbody.innerHTML = "";

    if (peminjaman.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="p-3 text-center">
                        Belum ada riwayat peminjaman
                    </td>
                </tr>
            `;
      return;
    }

    peminjaman.forEach((item) => {
      const baris = document.createElement("tr");
      baris.className = "border-t";

      const data = [
        item.id_peminjaman,
        item.judul_buku,
        item.nama_peminjam,
        item.kelas,
        item.tanggal_pinjam,
        item.tanggal_kembali || "-",
      ];

      data.forEach((nilai) => {
        const kolom = document.createElement("td");

        kolom.className = "p-3";
        kolom.textContent = nilai ?? "-";

        baris.appendChild(kolom);
      });

      // Kolom status

// Kolom status
const kolomStatus = document.createElement('td');
kolomStatus.className = 'px-5 py-4';

const labelStatus = document.createElement('span');

// Normalisasi status
const status = String(item.status ?? '').trim().toLowerCase();

const sedangDipinjam = status === 'dipinjam';

labelStatus.textContent = sedangDipinjam
    ? 'Dipinjam'
    : 'Dikembalikan';

if (sedangDipinjam) {
    labelStatus.className =
        'bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold';
} else {
    labelStatus.className =
        'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold';
}

kolomStatus.appendChild(labelStatus);
baris.appendChild(kolomStatus);


      // Kolom aksi
      const kolomAksi = document.createElement("td");
      kolomAksi.className = "p-3";

      if (sedangDipinjam) {
        const tombol = document.createElement("button");

        tombol.textContent = "Kembalikan";
        tombol.className =
          "bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-blue-800 transition";

        tombol.addEventListener("click", function () {
          kembalikanBuku(item.id_peminjaman);
        });

        kolomAksi.appendChild(tombol);
      } else {
        kolomAksi.innerHTML = `
    <span class="text-green-600 font-medium text-xs">
        Selesai
    </span>
`;
      }

      baris.appendChild(kolomAksi);
      tbody.appendChild(baris);
    });
  } catch (error) {
    console.error(error);

    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="p-3 text-center text-red-600">
                    Gagal memuat riwayat peminjaman
                </td>
            </tr>
        `;
  }
}

// Jalankan fungsi
tampilRiwayat();

// Memproses pengembalian buku
async function kembalikanBuku(id) {
  const konfirmasi = confirm("Apakah kamu yakin ingin mengembalikan buku ini?");

  if (!konfirmasi) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/peminjaman/${id}/kembali`, {
      method: "POST",
    });

    const hasil = await response.json();

    if (!response.ok) {
      throw new Error(hasil.error || "Gagal mengembalikan buku");
    }

    alert(hasil.message || "Buku berhasil dikembalikan!");

    // Memperbarui daftar riwayat
    tampilRiwayat();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}
