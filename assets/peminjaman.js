const API_URL = 'http://localhost:3000';

// Mengambil daftar buku dari database
async function tampilPilihanBuku() {
    const pilihanBuku = document.getElementById('id_buku');

    try {
        const response = await fetch(`${API_URL}/buku`);

        if (!response.ok) {
            throw new Error('Gagal mengambil data buku');
        }

        const buku = await response.json();

        pilihanBuku.innerHTML = '<option value="">Pilih Buku</option>';

        buku.forEach(item => {
            const opsi = document.createElement('option');

            opsi.value = item.id_buku;
            opsi.textContent = `${item.judul_buku} (Stok: ${item.stok})`;

            pilihanBuku.appendChild(opsi);
        });

    } catch (error) {
        console.error(error);
        pilihanBuku.innerHTML = '<option value="">Gagal memuat buku</option>';
    }
}

// Jalankan fungsi
tampilPilihanBuku();

// Mengirim data peminjaman ke backend
const formPeminjaman = document.getElementById('form-peminjaman');

formPeminjaman.addEventListener('submit', async function(event) {
    event.preventDefault();

    const id_buku = document.getElementById('id_buku').value;
    const nama_peminjam = document.getElementById('nama_peminjam').value;
    const kelas = document.getElementById('kelas').value;

    const dataPeminjaman = {
        id_buku: Number(id_buku),
        nama_peminjam: nama_peminjam,
        kelas: kelas
    };

    try {
        const response = await fetch(`${API_URL}/peminjaman`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataPeminjaman)
        });

        const hasil = await response.json();

        if (!response.ok) {
            throw new Error(hasil.error || 'Gagal melakukan peminjaman');
        }

        document.getElementById('pesan').textContent =
            hasil.message || 'Peminjaman berhasil!';

        document.getElementById('pesan').className =
            'mt-4 text-sm text-green-600';

        formPeminjaman.reset();

        // Perbarui stok buku pada dropdown
        tampilPilihanBuku();

    } catch (error) {
        document.getElementById('pesan').textContent = error.message;

        document.getElementById('pesan').className =
            'mt-4 text-sm text-red-600';

        console.error(error);
    }
});