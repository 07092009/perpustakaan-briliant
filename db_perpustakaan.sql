
CREATE TABLE KATEGORI_BUKU (
ID_KATEGORI SERIAL PRIMARY KEY,
NAMA_KATEGORI VARCHAR(100),
DESKRIPSI TEXT
)

CREATE TABLE BUKU (
ID_BUKU SERIAL PRIMARY KEY,
ID_KATEGORI INT,
JUDUL_BUKU VARCHAR (150),
PENULIS VARCHAR(100),
PENERBIT VARCHAR(100),
TAHUN_TERBIT INT,
STOK INT,

CONSTRAINT FK_BUKU_KATEGORI
FOREIGN KEY (ID_KATEGORI)
REFERENCES KATEGORI_BUKU(ID_KATEGORI)
ON UPDATE CASCADE
)

CREATE TABLE PEMINJAMAN (
ID_PEMINJAMAN SERIAL PRIMARY KEY,
ID_BUKU INT,
NAMA_PEMINJAM VARCHAR (100),
KELAS VARCHAR(30),
TANGGAL_PINJAM DATE,
TANGGAL_KEMBALI DATE,
STATUS VARCHAR(30),

CONSTRAINT FK_PEMINJAMAN_BUKU
FOREIGN KEY (ID_BUKU)
REFERENCES BUKU(ID_BUKU)
ON UPDATE CASCADE
)

INSERT INTO KATEGORI_BUKU (NAMA_KATEGORI, DESKRIPSI) VALUES
('Novel','Buku sastra fiksi yang ditunjukan untuk hiburan'),
('Artikel','Berisikan informasi-informasi faktual'),
('Pelajaran','Berbagai buku pelajaran mulai dari SD, SMP, Hingga SMA')

INSERT INTO BUKU (ID_KATEGORI, JUDUL_BUKU, PENULIS, PENERBIT, TAHUN_TERBIT, STOK) VALUES 
(1,'Laskar Pelangi','Andrea Hirata','Bentang Pustaka',2005,5),
(2,'The Power of Habit','Charles Duhigg','Random House',2012,4),
(1,'Bumi Manusia','Pramoedya Anantar','Hasta Mitra',1980,3),
(1,'Koala Kumal','Raditya Dika','GagasMedia',2014,6),
(2,'Educated','Tara Westover','Random House',2018,5),
(3,'Matematika Rumpun Kesehatan & Pekerjaan Sosial SMK Kelas XI','Arif Ediyanto & Maya Harsari','Penerbit Erlangga',2022,1),
(2,'History Of The World War','Saut Pasaribu','Alexander Books',2020,6),
(1,'Laut Bercerita','Leila S. Chudori','KPG (Kepustakaan Populer Gramedia)',2017,4),
(2,'Nineteenth Century Question','James Freeman Clarke','Indoliterasi',2022,4),
(1,'Cantik Itu Luka','Eka Kurniawan','Gramedia Pustaka Utama',2002,3)

INSERT INTO PEMINJAMAN (ID_BUKU, NAMA_PEMINJAM, KELAS, TANGGAL_PINJAM, TANGGAL_KEMBALI, STATUS) VALUES
(2,'Budi Winardi','XI TPM A','2026-12-10','2026-12-19','Kembali'),
(5,'Eko Susanto','X TEI A','2026-06-30','2026-07-06','Kembali'),
(10,'Ratna Dwi','XII DPIB A','2026-01-25','2026-02-01','Dipinjam')

drop table kategori_buku
drop table buku
drop table peminjaman