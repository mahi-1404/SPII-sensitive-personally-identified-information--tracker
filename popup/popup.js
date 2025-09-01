(async function(){


$('#setPass').addEventListener('click', async ()=>{
const p = $('#passphrase').value;
if (!p) return alert('Enter a passphrase.');
const configured = await vault.isConfigured();
if (!configured) {
await vault.setPassphrase(p); alert('Vault passphrase set.');
$('#vaultActions').style.display = '';
} else {
const ok = await vault.verifyPassphrase(p);
alert(ok ? 'Passphrase verified.' : 'Invalid passphrase.');
}
});


$('#saveVault').addEventListener('click', async ()=>{
const p = $('#vaultKey').value; const t = $('#vaultText').value;
if (!p || !t) return alert('Enter passphrase and text.');
try { await vault.saveItem(p, { note: t }); $('#vaultText').value = ''; await listVault(); } catch (e) { alert('Wrong passphrase.'); }
});


async function listVault(){
const p = $('#vaultKey').value; if (!p) return;
try {
const items = await vault.listItems(p);
const ul = $('#vaultList'); ul.innerHTML='';
items.slice().reverse().forEach(v => {
const li = document.createElement('li');
li.textContent = `${new Date(v.ts).toLocaleString()} — ${v.item.note}`;
ul.appendChild(li);
});
} catch { /* wrong passphrase */ }
}


$('#vaultKey').addEventListener('input', listVault);


$('#exportVault').addEventListener('click', async ()=>{
const pack = await storage.get('spiiVault');
if (!pack) return alert('Nothing to export.');
const blob = new Blob([JSON.stringify(pack)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = Object.assign(document.createElement('a'), { href: url, download: 'spii_vault_backup.json' });
a.click(); URL.revokeObjectURL(url);
});


$('#importVault').addEventListener('click', async ()=>{
const f = $('#importFile').files?.[0]; const p = $('#vaultKey').value;
if (!f || !p) return alert('Choose file and enter passphrase.');
const txt = await f.text();
const pack = JSON.parse(txt);
try { await vault.importBackup(p, pack); alert('Imported.'); await listVault(); } catch { alert('Import failed (wrong passphrase?)'); }
});


await refreshStats();
await initVault();
})();

