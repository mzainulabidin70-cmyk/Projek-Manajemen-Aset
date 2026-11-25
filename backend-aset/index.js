const express = require('express');
const cors = require('cors');
const supabase = require('./supabase');

const app = express();
app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Server Manajemen Aset V2 Berjalan!');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) {
    return res.status(401).json({ message: 'Email atau password salah' });
  }
  res.json({ message: 'Login berhasil', user: data });
});

app.get('/categories', async (req, res) => {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('id');
  res.json(data || []);
});

app.post('/categories', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name: req.body.name }])
    .select();
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.put('/categories/:id', async (req, res) => {
  const { name } = req.body;
  const { data, error } = await supabase
  .from('categories')
  .update({ name })
  .eq('id', req.params.id)
  .select();

  if (error)
    return res.status(400).json(error);
  res.json(data);
});

app.delete('/categories/:id', async (req, res) => {
  const { data, error } = await supabase
  .from('categories')
  .delete()
  .eq('id', req.params.id)
  .select('id');

  if (error)
    return res.status(400).json(error);
  if (!data?.length)
    return res.status(404).json({ message: "Barang tidak ditemukan" });
  res.json(data);
});

app.get('/rooms', async (req, res) => {
  const { data } = await supabase
    .from('rooms')
    .select('*')
    .order('id');
  res.json(data || []);
});

app.post('/rooms', async (req, res) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ name: req.body.name }])
    .select();
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.put('/rooms/:id', async (req, res) => {
  const { name } = req.body;
  const { data, error } = await supabase
  .from('rooms')
  .update({ name })
  .eq('id', req.params.id)
  .select();

  if (error)
    return res.status(400).json(error);
  res.json(data);
});

app.delete("/rooms/:id", async (req, res) => {
  const { data, error } = await supabase
  .from('rooms')
  .delete()
  .eq('id', req.params.id)
  .select('id')

  if (error)
    return res.status(400).json(error);
  if (!data?.length)
    return res.status(404).json({ message: "Ruangan tidak ditemukan" });
  res.json(data);
});

app.post('/users', async (req, res) => {
  const { name, email, password, role } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password, role }])
    .select();
  if (error) return res.status(400).json(error);
  res.json(data);
});

app.get('/assets', async (req, res) => {
  const { data: assets, error } = await supabase
    .from('assets')
    .select('*')
    .order('id', { ascending: false });

  if (error) return res.status(500).json(error);

  const { data: categories } = await supabase
    .from('categories')
    .select('*');

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*');

  const hasil = assets.map((a) => ({
    ...a,
    category_name: categories?.find((c) => c.id === a.category_id)?.name || '-',
    room_name: rooms?.find((r) => r.id === a.room_id)?.name || '-',
  }));

  res.json(hasil);
});

app.post('/assets', async (req, res) => {
  const { name, asset_code, serial_number, category_id, room_id, condition } = req.body;
  const { data, error } = await supabase
    .from('assets')
    .insert([
      {
        name,
        category_id: category_id || null,
        room_id: room_id || null,
        condition: condition || 'Bagus',
        status: 'Tersedia',
      },
    ])
    .select();

  if (error) return res.status(400).json(error);
  res.json(data);
});

app.put('/assets/:id', async (req, res) => {
  const { name, asset_code, serial_number, category_id, room_id, condition } = req.body;
  const { data, error } = await supabase
    .from('assets')
    .update({
      name,
      asset_code,
      serial_number,
      category_id: category_id || null,
      room_id: room_id || null,
      condition,
    })
    .eq('id', req.params.id)
    .select();

  if (error) return res.status(400).json(error);
  res.json(data);
});

app.delete('/assets/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('assets')
    .delete()
    .eq('id', req.params.id)
    .select('id');
  if (error) return res.status(400).json(error);
  if (!data?.length) return res.status(404).json({ message: 'Barang tidak ditemukan' });
  res.json({ message: 'Barang berhasil dihapus' });
});

app.get('/loans', async (req, res) => {
  const { data: loans, error } = await supabase
    .from('loans')
    .select('*')
    .order('id', { ascending: false });

  if (error) return res.status(500).json(error);

  const { data: assets } = await supabase
    .from('assets')
    .select('id, name');
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email');

  const hasil = loans.map((l) => {
    const asset = assets?.find((a) => a.id === l.asset_id);
    const user = users?.find((u) => u.id === l.user_id);
    return {
      ...l,
      asset_name: asset?.name || '-',
      user_name: user?.name || '-',
    };
  });

  res.json(hasil);
});   

app.post('/loans', async (req, res) => {
  const { asset_id, user_id } = req.body;
  const { data, error } = await supabase
    .from('loans')
    .insert([{ asset_id, user_id, status: 'Menunggu' }])
    .select();

  if (error) return res.status(400).json(error);
  res.json(data);
});

app.delete('/loans/:id', async (req, res) => {
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .select('id, status')
    .eq('id', req.params.id)
    .single();

  if (loanError || !loan) {
    return res.status(404).json({ message: 'Pinjaman tidak ditemukan' });
  }

  if (loan.status !== 'Menunggu') {
    return res.status(400).json({
      message: 'Hanya pengajuan pinjaman yang masih menunggu yang dapat dibatalkan',
    });
  }

  const { data: deletedLoan, error } = await supabase
    .from('loans')
    .delete()
    .eq('id', loan.id)
    .eq('status', 'Menunggu')
    .select('id');

  if (error) return res.status(400).json(error);
  if (!deletedLoan?.length) {
    return res.status(400).json({ message: 'Pengajuan pinjaman sudah tidak dapat dibatalkan' });
  }

  res.json({ message: 'Pengajuan pinjaman berhasil dibatalkan' });
});

app.put('/loans/:id/checkout', async (req, res) => {
  const { asset_id } = req.body;
  await supabase
    .from('loans')
    .update({ status: 'Disetujui', borrow_date: new Date() })
    .eq('id', req.params.id);

  await supabase
    .from('assets')
    .update({ status: 'Dipinjam' })
    .eq('id', asset_id);

  res.json({ message: 'Barang berhasil diserahkan (Check-out)' });
});

app.put('/loans/:id/checkin', async (req, res) => {
  const { asset_id, condition } = req.body;
  await supabase
    .from('loans')
    .update({ status: 'Dikembalikan', return_date: new Date() })
    .eq('id', req.params.id);

  await supabase
    .from('assets')
    .update({ status: 'Tersedia', condition })
    .eq('id', asset_id);

  res.json({ message: 'Barang berhasil diterima kembali (Check-in)' });
});

app.put('/loans/:id/damage', async (req, res) => {
  const { damage_report } = req.body;
  await supabase
    .from('loans')
    .update({ damage_report })
    .eq('id', req.params.id);

  res.json({ message: 'Laporan kerusakan terkirim' });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
