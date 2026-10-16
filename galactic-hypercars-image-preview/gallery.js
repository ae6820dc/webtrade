const $ = id => document.getElementById(id);
const pageSize = 12;
let cars = [], page = 1;
const colors = {'Ion ezüst':'silver','Obszidián':'black obsidian','Plazma kék':'blue','Nebula lila':'purple','Aurora cián':'cyan','Napkorona arany':'gold','Mars vörös':'red','Holdfehér':'white'};
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function render() {
  const query = normalize($('search').value.trim());
  const status = $('status').value;
  const filtered = cars.filter(c => (status === 'all' || (status === 'completed' ? !!c.image : !c.image)) && normalize(`${c.id} ${c.name} ${c.exterior} ${colors[c.exterior] || ''}`).includes(query));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  page = Math.min(page, pages);
  $('gallery').replaceChildren();
  for (const c of filtered.slice((page - 1) * pageSize, page * pageSize)) {
    const card = node('article', '', 'card'); card.id = c.id;
    if (c.image) {
      const link = node('a', '', 'art'); link.href = c.image; link.setAttribute('aria-label', `View full image of ${c.name}`);
      const img = node('img'); Object.assign(img, {src: c.image, alt: `${c.name} in ${c.exterior}`, width: 1536, height: 1024, loading: 'lazy', decoding: 'async'});
      img.addEventListener('error', () => { link.replaceWith(node('p', `Image unavailable · ${c.id}`, 'pending')); });
      link.append(img, node('span', 'View image ↗', 'expand')); card.append(link);
    } else card.append(node('div', 'Pending generation · no image yet', 'pending'));
    const caption = node('div', '', 'caption');
    caption.append(node('div', c.id, 'meta'), node('p', c.manufacturer, 'maker'), node('h2', c.model));
    const tags = node('div', '', 'tags'); tags.append(node('span', c.exterior), node('span', c.propulsion), node('span', c.image ? 'Completed image' : 'Pending'));
    caption.append(tags); card.append(caption); $('gallery').append(card);
  }
  $('results').textContent = filtered.length ? `${filtered.length.toLocaleString()} matches · showing ${(page-1)*pageSize+1}–${Math.min(page*pageSize,filtered.length)}` : 'No matching cars.';
  $('page').textContent = `Page ${page} of ${pages}`;
  $('previous').disabled = page === 1; $('next').disabled = page === pages;
}
for (const id of ['search', 'status']) $(id).addEventListener(id === 'search' ? 'input' : 'change', () => { page = 1; render(); });
for (const [id, delta] of [['previous', -1], ['next', 1]]) $(id).addEventListener('click', () => { page += delta; render(); $('collection').scrollIntoView(); });
fetch('manifest.json').then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).then(m => {
  cars = m.cars;
  const done = cars.filter(c => c.image).length;
  $('completed').textContent = done;
  $('remaining').textContent = m.catalogCount - done;
  $('coverage').textContent = `${done} / ${m.catalogCount.toLocaleString()} completed`;
  $('progress').textContent = `${done} real image files completed. ${m.catalogCount - done} cars await generation. The original application remains unchanged.`;
  render();
}).catch(() => { $('results').textContent = 'Unable to load the catalog. Please reload to try again.'; });
