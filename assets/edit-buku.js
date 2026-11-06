const API_URL = 'http://localhost:3000';

// Mengambil id dari URL 
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// Mengambil elemen form
const judulBuku = document.getElementById('judul_buku');
const penulis = document.getElementById('penulis');
const penerbit = document.getElementById('penerbit');
const tahunTerbit = document.getElementById('tahun_terbit');
const stok = document.getElementById('stok');
const pesan = document.getElementById('pesan');

// Mengambil data buku berdasarkan ID
async function tampilkanDataBuku() {
    try {
        const response = await fetch(`${API_URL}/buku/${id}`);

        if (!response.ok) {
            throw new Error('Gagal mengambil data buku');
        }

        const buku = await response.json();

        judulBuku.value = buku.judul_buku;
        penulis.value = buku.penulis;
        penerbit.value = buku.penerbit;
        tahunTerbit.value = buku.tahun_terbit;
        stok.value = buku.stok;

    } catch (error) {
        console.error(error);
        pesan.textContent = error.message;
        pesan.className = 'mt-4 text-sm text-red-600';
    }
}

tampilkanDataBuku();

const formEdit = document.getElementById('form-edit');

formEdit.addEventListener('submit', async function(event) {
    event.preventDefault();

    const dataBuku = {
        judul_buku: judulBuku.value,
        penulis: penulis.value,
        penerbit: penerbit.value,
        tahun_terbit: Number(tahunTerbit.value),
        stok: Number(stok.value)
    };

    try {
        const response = await fetch(`${API_URL}/buku/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataBuku)
        });

        if (!response.ok) {
            throw new Error('Gagal memperbarui data buku');
        }

        const hasil = await response.json();

        pesan.textContent = `Buku "${hasil.judul_buku}" berhasil diperbarui!`;
        pesan.className = 'mt-4 text-sm text-green-600';

    } catch (error) {
        console.error(error);
        pesan.textContent = error.message;
        pesan.className = 'mt-4 text-sm text-red-600';
    }
});