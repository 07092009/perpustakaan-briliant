// Alamat backend API
const API_URL = 'http://localhost:3000';

async function tampilkanKategori(){
    const selectKategori = document.getElementById('id_kategori');

    try{
        const response = await fetch(`${API_URL}/kategori`);
        if(!response.ok){
            throw new Error('Gagal mengambil kategori');
        }

        const kategori = await response.json()

        kategori.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id_kategori;
            option.textContent = item.nama_kategori;

            selectKategori.appendChild(option);
        })
    } catch (error){
        console.error(error)
        selectKategori.innerHTML = 
        '<option value="">Gagal memuat kategori</option>'
    }
}

tampilkanKategori()

// Mengambil elemen form dan pesan dari HTML
const formBuku = document.getElementById('form-buku');
const pesan = document.getElementById('pesan');

// Mendeteksi ketika form dikirim
formBuku.addEventListener('submit', async function(event) {

    // Mencegah halaman melakukan reload
    event.preventDefault();

    // Mengambil data dari setiap input
    const dataBuku = {
        id_kategori: Number(document.getElementById('id_kategori').value),
        judul_buku: document.getElementById('judul_buku').value,
        penulis: document.getElementById('penulis').value,
        penerbit: document.getElementById('penerbit').value,
        tahun_terbit: Number(document.getElementById('tahun_terbit').value),
        stok: Number(document.getElementById('stok').value)
    };

    try {

        // Mengirim data ke backend
        const response = await fetch(`${API_URL}/buku`, {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(dataBuku)
        });

        // Memeriksa respons server
        if (!response.ok) {
            throw new Error('Gagal menambahkan buku');
        }

        // Mengambil respons JSON
        const hasil = await response.json();

        // Menampilkan pesan berhasil
        pesan.textContent = `Buku "${hasil.judul_buku}" berhasil ditambahkan!`;
        pesan.className = 'mt-4 text-sm text-green-600';

        // Mengosongkan form
        formBuku.reset();

    } catch (error) {

        // Menampilkan pesan kesalahan
        console.error(error);

        pesan.textContent = error.message;
        pesan.className = 'mt-4 text-sm text-red-600';

    }

});
