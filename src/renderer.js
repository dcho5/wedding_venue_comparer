if (window.__rendererInitialized) {
  console.log('Renderer already initialized, skipping');
} else {
  window.__rendererInitialized = true;

  let api;
  if (!window.api) {
    console.error('API not exposed by preload. window.api is undefined.');
  } else {
    api = window.api;
  }

  let venues = [];
  let currentEditId = null;
  let stagedPhotos = [];
  let compareMode = true;
  let selectedForCompare = new Set();

function $(s) { return document.querySelector(s); }

function formatMoney(v){ return `$${Number(v||0).toFixed(2)}`; }

function calcBarCost(v){
  const rate = Number(v.bar_service_rate||0);
  const flat = Number(v.bar_flat_fee||0);
  const guests = Number(v.guest_count||0);
  const base = rate * guests;
  return base + flat;
}

function calcTotals(v){
  const guests = Number(v.guest_count||0);
  const cateringRate = Number(v.catering_per_person||0);
  const cateringFlat = Number(v.catering_flat_fee||0);
  const catering = (cateringRate * guests) + cateringFlat;
  const bar = calcBarCost(v);
  const total = Number(v.venue_rental_cost||0) + catering + bar + Number(v.coordinator_fee||0) + Number(v.event_insurance||0) + Number(v.other_costs||0);
  const perGuest = (Number(v.guest_count||0) > 0) ? (total / Number(v.guest_count||0)) : 0;
  return { catering, bar, total, perGuest };
}

// Update placeholders/labels for rate inputs based on toggle selection
// syncToggleFromHidden removed (no toggles remain)

async function loadVenues(){
  venues = await api.getVenues();
  renderVenues();
}

function renderVenues(){
  const container = $('#venuesContainer');
  container.innerHTML = '';

  // compute min/max for highlights per category
  const keys = ['venue_rental_cost','catering','bar','coordinator_fee','event_insurance','other_costs','total'];
  const mapped = venues.map(v=>{
    const t = calcTotals(v);
    return { ...v, catering: t.catering, bar: t.bar, total: t.total, perGuest: t.perGuest };
  });
  const stats = {};
  for (const k of ['venue_rental_cost','catering','bar','coordinator_fee','event_insurance','other_costs','total']){
    const vals = mapped.map(m => Number(m[k]||0));
    stats[k] = { min: Math.min(...vals), max: Math.max(...vals) };
  }

  // apply search and sort
  const q = $('#search').value.toLowerCase();
  const sort = $('#sort').value;
  let list = mapped.filter(v => (v.name||'').toLowerCase().includes(q));
  if (sort==='total') list.sort((a,b)=>a.total - b.total);
  if (sort==='name') list.sort((a,b)=>(a.name||'').localeCompare(b.name||''));
  if (sort==='date') list.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));

  for (const v of list){
    const card = document.createElement('div'); card.className='card';
    if (selectedForCompare.has(v.id)) card.classList.add('compare-selected');
    
    // Make entire card clickable for selection
    card.onclick = (e) => {
      // Don't select if clicking on buttons
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        return;
      }
      
      if (selectedForCompare.has(v.id)) {
        selectedForCompare.delete(v.id);
        card.classList.remove('compare-selected');
      } else {
        selectedForCompare.add(v.id);
        card.classList.add('compare-selected');
      }
      updateCompareButton();
    };
    
    const img = document.createElement('img');
      (async ()=>{
        const userData = await api.getUserDataPath();
        if (v.title_photo) {
          img.src = `file://${userData}/${v.title_photo}`;
        } else {
          const photos = await api.getPhotos(v.id);
          if (photos && photos[0]){
            img.src = `file://${userData}/${photos[0].file_path}`;
          } else {
            img.src = '';
            img.style.background='#f0f2f6';
            img.style.height='100px';
          }
        }
      })();
    card.appendChild(img);
    const h = document.createElement('h3'); h.textContent = v.name || 'Untitled'; card.appendChild(h);
    const meta = document.createElement('div'); meta.className='meta'; meta.textContent = `${v.guest_count||0} guests • ${v.event_duration_hours||0} hrs`; card.appendChild(meta);
    const costs = document.createElement('div'); costs.className='costs';
    const rows = [];
    rows.push(['Rental', v.venue_rental_cost || 0, 'venue_rental_cost']);
    rows.push(['Catering', v.catering, 'catering']);
    rows.push(['Bar', v.bar, 'bar']);
    rows.push(['Coordinator', v.coordinator_fee || 0, 'coordinator_fee']);
    rows.push(['Event Insurance', v.event_insurance || 0, 'event_insurance']);
    rows.push(['Other', v.other_costs || 0, 'other_costs']);
    for (const r of rows){
      const div = document.createElement('div'); div.className='cost-row';
      const label = document.createElement('div'); label.textContent = r[0];
      const val = document.createElement('div'); val.textContent = formatMoney(r[1]);
      if (Number(r[1])===stats[r[2]].min) div.classList.add('highlight-low');
      if (Number(r[1])===stats[r[2]].max) div.classList.add('highlight-high');
      div.appendChild(label); div.appendChild(val); costs.appendChild(div);
    }
    const totalRow = document.createElement('div'); totalRow.className='cost-row';
    totalRow.innerHTML = `<strong>Total</strong><strong>${formatMoney(v.total)}</strong>`;
    if (v.total===stats.total.min) totalRow.classList.add('highlight-low');
    if (v.total===stats.total.max) totalRow.classList.add('highlight-high');
    costs.appendChild(totalRow);
    const perGuest = document.createElement('div'); perGuest.className='meta'; perGuest.textContent = `Per guest: ${formatMoney(v.perGuest)}`;
    costs.appendChild(perGuest);
    card.appendChild(costs);

    const actions = document.createElement('div'); actions.className='venue-actions';
    const viewBtn = document.createElement('button'); viewBtn.textContent='View';
    viewBtn.onclick = (e)=>{ e.stopPropagation(); openDetail(v.id); };
    const editBtn = document.createElement('button'); editBtn.textContent='Edit'; editBtn.className='secondary';
    editBtn.onclick = (e)=>{ e.stopPropagation(); openEdit(v.id); };
    actions.appendChild(viewBtn); actions.appendChild(editBtn);
    card.appendChild(actions);

    container.appendChild(card);
  }
}



async function openEdit(id){
  currentEditId = id;
  const v = venues.find(x=>x.id===id);
  openModal(v);
}

function openModal(v){
  console.log('openModal called with venue:', v);
  const modal = $('#modal');
  console.log('modal element:', modal);
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
  const pc = $('#photoCount');
  if (pc) pc.textContent = (stagedPhotos.length || 0) + ' photos';
  const mt = $('#modalTitle');
  if (mt) mt.textContent = v ? 'Edit Venue' : 'Add Venue';
  const f = $('#venueForm');
  if (f) {
    f.reset();
    if (v) {
      for (const key in v) {
        const el = f.elements[key];
        if (!el) continue;
        el.value = v[key];
      }
      // sync slider badges to loaded data
      syncSliderBadges();
      // load existing photos for edit
      (async ()=>{
        stagedPhotos = [];
        try {
          const photos = await api.getPhotos(v.id);
          const userData = await api.getUserDataPath();
          for (const p of photos){
            stagedPhotos.push({ id: p.id, file_path: p.file_path, isNew: false, src: `file://${userData}/${p.file_path}`, isTitle: (v.title_photo===p.file_path) });
          }
          const pc = $('#photoCount'); if (pc) pc.textContent = (stagedPhotos.length || 0) + ' photos';
          recalcFormTotal();
        } catch (e) { console.error('load photos failed', e); }
      })();
    }
    // ensure badges match current slider values on open
    syncSliderBadges();
    recalcFormTotal();
  }
}

function syncSliderBadges(){
  const guestRange = $('#guest_count');
  const guestBadge = $('#guestBadge');
  if (guestRange && guestBadge) guestBadge.textContent = guestRange.value;
  const durRange = $('#event_duration_hours');
  const durBadge = $('#durationBadge');
  if (durRange && durBadge) durBadge.textContent = durRange.value;
}

function closeModal(){
  $('#modal').classList.add('hidden'); currentEditId = null; stagedPhotos = [];
}

function recalcFormTotal(){
  const f = $('#venueForm');
  const values = {};
  for (const el of f.elements){ if (!el.name) continue; values[el.name]=el.value; }
  // Clamp numeric fields to non-negative values
  const numericKeys = ['guest_count','event_duration_hours','venue_rental_cost','catering_per_person','catering_flat_fee','bar_service_rate','bar_flat_fee','coordinator_fee','event_insurance','other_costs'];
  for (const k of numericKeys){ if (values[k]!==undefined){ const n = Number(values[k]||0); values[k] = Math.max(0, isNaN(n) ? 0 : n); } }
  const t = calcTotals(values);
  
  // Animate total updates
  const prevTotal = $('#calculatedTotal').textContent;
  const newTotal = formatMoney(t.total);
  $('#calculatedTotal').textContent = newTotal;
  const summary = $('#summaryTotal'); 
  if (summary) {
    const summaryPanel = summary.closest('.summary-panel');
    if (prevTotal !== newTotal && prevTotal !== '$0.00') {
      summaryPanel?.classList.add('updated');
      setTimeout(() => summaryPanel?.classList.remove('updated'), 800);
    }
    summary.textContent = newTotal;
  }
  const per = $('#summaryPerGuest'); if (per) per.textContent = `Per guest: ${formatMoney(t.perGuest)}`;
  
  // Check if required fields are complete (name + at least one cost)
  const hasName = values.name && values.name.trim().length > 0;
  const hasCost = t.total > 0;
  const form = $('#venueForm');
  if (hasName && hasCost) {
    form?.classList.add('form-complete');
    setTimeout(() => form?.classList.remove('form-complete'), 1200);
  }

  // update bar preview with animation
  const bp = $('#barPreview');
  if (bp){
    const rate = Number(values.bar_service_rate||0);
    const flat = Number(values.bar_flat_fee||0);
    const guests = Number(values.guest_count||0);
    const hours = Number(values.event_duration_hours||0);
    const newBarText = `${formatMoney(rate)}/person × ${guests} + ${formatMoney(flat)} = ${formatMoney((rate*guests)+flat)}`;
    if (bp.textContent !== newBarText && bp.textContent) {
      const barCard = bp.closest('.cost-card');
      barCard?.classList.add('cost-updated');
      setTimeout(() => barCard?.classList.remove('cost-updated'), 600);
    }
    bp.textContent = newBarText;
  }

  // update catering preview with animation
  const cp = $('#cateringPreview');
  if (cp){
    const crate = Number(values.catering_per_person||0);
    const flat = Number(values.catering_flat_fee||0);
    const guests = Number(values.guest_count||0);
    const newCateringText = `${formatMoney(crate)}/person × ${guests} + ${formatMoney(flat)} = ${formatMoney((crate*guests)+flat)}`;
    if (cp.textContent !== newCateringText && cp.textContent) {
      const cateringCard = cp.closest('.cost-card');
      cateringCard?.classList.add('cost-updated');
      setTimeout(() => cateringCard?.classList.remove('cost-updated'), 600);
    }
    cp.textContent = newCateringText;
  }

  // update staged photo preview (thumbnails, clickable to mark title)
  const preview = $('#photoPreview');
  if (preview){
    preview.innerHTML = '';
    stagedPhotos.forEach((p, idx) => {
      const wrapper = document.createElement('div'); wrapper.className = 'thumb';
      const img = document.createElement('img');
      if (p.isNew) img.src = `file://${p.localPath}`;
      else if (p.src) img.src = p.src;
      else if (p.file_path) (async ()=>{ const ud = await api.getUserDataPath(); img.src = `file://${ud}/${p.file_path}`; })();
      img.dataset.index = String(idx);
      img.style.cursor = 'pointer';
      if (p.isTitle) wrapper.classList.add('is-title');
      img.onclick = (ev) => { const i = Number(ev.target.dataset.index); stagedPhotos.forEach((s,j)=> s.isTitle = (i===j)); recalcFormTotal(); };
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'remove-photo'; btn.textContent = '✕';
      btn.setAttribute('aria-label','Remove photo'); btn.title = 'Remove photo';
      btn.onclick = (ev) => {
        ev.stopPropagation();
        // If this is a new, unsaved photo, remove immediately
        if (p.isNew) {
          stagedPhotos.splice(idx, 1);
          const pc = $('#photoCount'); if (pc) pc.textContent = stagedPhotos.length + ' photos';
          recalcFormTotal();
          return;
        }
        // For persisted photos, mark as pending delete and offer undo
        if (p.toDelete) return; // already pending
        p.toDelete = true;
        p._wasTitle = p.isTitle || false;
        // Only clear title selection if THIS photo was the title
        if (p.isTitle) {
          p.isTitle = false;
          const hidden = document.getElementById('title_photo_input'); if (hidden) hidden.value = '';
        }
        // change button to 'Undo'
        btn.textContent = 'Undo';
        btn.title = 'Undo delete';
        btn.classList.add('undo');
        wrapper.classList.add('pending-delete');
        // start timer to perform actual deletion after delay
        p._deleteTimer = setTimeout(async ()=>{
          try {
            console.log('Performing delete for photo id', p.id);
            const res = await api.deletePhoto({ id: p.id, file_path: p.file_path });
            console.log('deletePhoto response', res);
            if (!res || !res.success) {
              console.error('deletePhoto failed', res);
              alert('Failed to delete photo: ' + (res && res.message ? res.message : JSON.stringify(res)));
              // clear pending state so user can try again
              p.toDelete = false; wrapper.classList.remove('pending-delete'); btn.textContent = '✕'; btn.title = 'Remove photo'; btn.classList.remove('undo');
              return;
            }
            // remove from stagedPhotos array
            const i = stagedPhotos.indexOf(p);
            if (i!==-1) stagedPhotos.splice(i,1);
            const pc2 = $('#photoCount'); if (pc2) pc2.textContent = stagedPhotos.length + ' photos';
            recalcFormTotal();
          } catch (e) {
            console.error('delete-photo error', e);
            alert('Error deleting photo: ' + (e && e.message ? e.message : String(e)));
            p.toDelete = false; wrapper.classList.remove('pending-delete'); btn.textContent = '✕'; btn.title = 'Remove photo'; btn.classList.remove('undo');
          }
        }, 8000);

        // change handler to perform undo if clicked while pending
        btn.onclick = (ev2)=>{
          ev2.stopPropagation();
          if (!p.toDelete) return;
          // cancel timer and restore
          if (p._deleteTimer) { clearTimeout(p._deleteTimer); p._deleteTimer = null; }
          p.toDelete = false;
          wrapper.classList.remove('pending-delete');
          btn.textContent = '✕'; btn.title = 'Remove photo'; btn.classList.remove('undo');
          if (p._wasTitle) { p.isTitle = true; const hidden2 = document.getElementById('title_photo_input'); if (hidden2) hidden2.value = p.file_path || ''; }
          recalcFormTotal();
        };
      };
      wrapper.appendChild(img);
      wrapper.appendChild(btn);
      preview.appendChild(wrapper);
    });
  }

  // update title photo preview area
  const titleArea = document.getElementById('titlePhotoPreview');
  if (titleArea){
    titleArea.innerHTML = '';
    const chosen = stagedPhotos.find(p=>p.isTitle);
    if (chosen){
      const img = document.createElement('img');
      if (chosen.isNew) img.src = `file://${chosen.localPath}`;
      else if (chosen.src) img.src = chosen.src;
      else if (chosen.file_path) { (async ()=>{ const ud = await api.getUserDataPath(); img.src = `file://${ud}/${chosen.file_path}`; })(); }
      img.className = 'title-thumb';
      titleArea.appendChild(img);
      // set hidden input if present
      const hidden = document.getElementById('title_photo_input'); if (hidden){ hidden.value = chosen.file_path || ''; }
    } else {
      const hidden = document.getElementById('title_photo_input'); if (hidden) hidden.value = '';
    }
  }
}

async function submitForm(e){
  e.preventDefault();
  const f = $('#venueForm');
  const data = {};
  for (const el of f.elements){ if (!el.name) continue; data[el.name] = el.value; }
  // prevent duplicate venue names (case-insensitive)
  const normalizedName = String(data.name || '').trim();
  const normalizedLower = normalizedName.toLowerCase();
  if (!normalizedName) {
    alert('Venue name is required.');
    return;
  }
  const duplicate = venues.find(v => {
    if (!v || v.name == null) return false;
    const existing = String(v.name).trim().toLowerCase();
    if (!existing) return false;
    if (currentEditId && v.id === currentEditId) return false;
    return existing === normalizedLower;
  });
  if (duplicate) {
    alert('A venue with this name already exists. Please choose a different name.');
    return;
  }
  data.name = normalizedName;
  // coerce numbers (always set defaults)
  ['guest_count','event_duration_hours','venue_rental_cost','catering_per_person','catering_flat_fee','bar_service_rate','bar_flat_fee','coordinator_fee','event_insurance','other_costs']
    .forEach(k=>{ const n = Number(data[k] ?? 0); data[k]=Math.max(0, isNaN(n)?0:n); });

  // chosen title among stagedPhotos (may be existing or new)
  const chosenTitle = stagedPhotos.find(p=>p.isTitle);
  const newItems = stagedPhotos.filter(p=>p.isNew);
  const newPayload = newItems.map((p,i)=> ({ path: p.localPath, tempId: i }));

  if (currentEditId) {
    // update venue base data first
    await api.updateVenue(currentEditId, data);
    let added = [];
    if (newPayload.length) added = await api.addPhotos(currentEditId, newPayload);
    // map title if chosen
    let finalTitle = null;
    if (chosenTitle){
      if (chosenTitle.isNew){
        const mapped = added.find(a=>a.tempId!==undefined && a.tempId === newItems.indexOf(chosenTitle));
        if (mapped) finalTitle = mapped.file_path;
      } else if (chosenTitle.file_path) finalTitle = chosenTitle.file_path;
    }
    if (finalTitle){
      const existing = venues.find(x=>x.id===currentEditId) || {};
      const merged = { ...existing, ...data, title_photo: finalTitle };
      await api.updateVenue(currentEditId, merged);
    }
  } else {
    const id = await api.createVenue(data);
    let added = [];
    if (newPayload.length) added = await api.addPhotos(id, newPayload);
    let finalTitle = null;
    if (chosenTitle){
      if (chosenTitle.isNew){
        const mapped = added.find(a=>a.tempId!==undefined && a.tempId === newItems.indexOf(chosenTitle));
        if (mapped) finalTitle = mapped.file_path;
      } else if (chosenTitle.file_path) finalTitle = chosenTitle.file_path;
    }
    if (finalTitle){
      const merged = { ...data, title_photo: finalTitle };
      await api.updateVenue(id, merged);
    }
  }
  closeModal();
  loadVenues();
}

async function openDetail(id){
  $('#detail').classList.remove('hidden');
  const v = venues.find(x=>x.id===id);
  const photos = await api.getPhotos(id);
  const userData = await api.getUserDataPath();
  const content = $('#detailContent'); content.innerHTML = '';
  const title = document.createElement('h2'); title.textContent = v.name; content.appendChild(title);
  const meta = document.createElement('div'); meta.className='meta'; meta.textContent = `${v.guest_count||0} guests • ${v.event_duration_hours||0} hrs`; content.appendChild(meta);
  const costs = document.createElement('div'); costs.className='costs';
  const t = calcTotals(v);
  costs.innerHTML = `
    <div class="cost-row"><div>Venue Rental</div><div>${formatMoney(v.venue_rental_cost)}</div></div>
    <div class="cost-row"><div>Catering</div><div>${formatMoney(t.catering)}</div></div>
    <div class="cost-row"><div>Bar</div><div>${formatMoney(t.bar)}</div></div>
    <div class="cost-row"><div>Coordinator</div><div>${formatMoney(v.coordinator_fee)}</div></div>
    <div class="cost-row"><div>Event Insurance</div><div>${formatMoney(v.event_insurance)}</div></div>
    <div class="cost-row"><div><strong>Total</strong></div><div><strong>${formatMoney(t.total)}</strong></div></div>
  `;
  content.appendChild(costs);
  const gallery = document.createElement('div'); gallery.className='gallery';
  for (let i=0;i<photos.length;i++){ const p = photos[i]; const img = document.createElement('img'); img.className='thumbnail'; img.src = `file://${userData}/${p.file_path}`; img.style.cursor='pointer'; img.onclick = ()=>openLightbox(photos.map(x=>`file://${userData}/${x.file_path}`), i); gallery.appendChild(img); }
  content.appendChild(gallery);
  if (v.notes) { const notes = document.createElement('div'); notes.textContent = v.notes; content.appendChild(notes); }
}

let __lightboxState = null;
function openLightbox(gallery, startIndex){
  if (!Array.isArray(gallery) || gallery.length===0) return;
  let lb = document.getElementById('lightbox');
  if (!lb){ lb = document.createElement('div'); lb.id='lightbox'; lb.onclick = (e)=>{ if (e.target.id==='lightbox') closeLightbox(); }; document.body.appendChild(lb); }
  __lightboxState = { gallery, index: startIndex || 0 };

  function render(){
    const src = __lightboxState.gallery[__lightboxState.index];
    lb.innerHTML = `
      <button class="lightbox-arrow left" aria-label="Previous">◀</button>
      <img src="${src}" />
      <button class="lightbox-arrow right" aria-label="Next">▶</button>
    `;
    const left = lb.querySelector('.lightbox-arrow.left');
    const right = lb.querySelector('.lightbox-arrow.right');
    left.onclick = (ev)=>{ ev.stopPropagation(); prevLightbox(); };
    right.onclick = (ev)=>{ ev.stopPropagation(); nextLightbox(); };
  }

  function onKey(e){
    if (!__lightboxState) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
  }

  function prevLightbox(){ __lightboxState.index = (__lightboxState.index - 1 + __lightboxState.gallery.length) % __lightboxState.gallery.length; render(); }
  function nextLightbox(){ __lightboxState.index = (__lightboxState.index + 1) % __lightboxState.gallery.length; render(); }
  function closeLightbox(){
    const el = document.getElementById('lightbox');
    if (el) el.remove();
    __lightboxState = null;
    document.removeEventListener('keydown', onKey);
  }

  // expose helpers to outer scope so arrow buttons can call them
  window.__lb_prev = prevLightbox;
  window.__lb_next = nextLightbox;
  window.__lb_close = closeLightbox;

  render();
  document.addEventListener('keydown', onKey);
}

console.log('renderer.js script executing');
document.addEventListener('DOMContentLoaded', init);

async function init() {
  if (!window.api) { console.error('API not available'); return; }
  // Attach click handlers
  const addBtn = $('#addBtn');
  if (addBtn) {
    addBtn.onclick = () => openModal(null);
  }

  const cancelBtn = $('#cancelBtn');
  if (cancelBtn) {
    cancelBtn.onclick = closeModal;
  }

  const venueForm = $('#venueForm');
  if (venueForm) {
    venueForm.onsubmit = submitForm;
    venueForm.oninput = recalcFormTotal;
  }

  // wire new controls: sliders, cost inputs
  const guestRange = $('#guest_count');
  const guestBadge = $('#guestBadge');
  const guestUp = $('#guestUp');
  const guestDown = $('#guestDown');
  let suppressGuestSnap = false;
  if (guestRange && guestBadge) {
    guestBadge.textContent = guestRange.value;
    guestRange.oninput = () => {
      const rawValue = Number(guestRange.value);
      if (!suppressGuestSnap) {
        // Snap to multiples of 5 when dragging the slider
        const snappedValue = Math.round(rawValue / 5) * 5;
        guestRange.value = snappedValue;
        guestBadge.textContent = snappedValue;
      } else {
        guestBadge.textContent = rawValue;
      }
      recalcFormTotal();
    };
    if (guestUp) {
      guestUp.onclick = () => {
        suppressGuestSnap = true;
        const current = Number(guestRange.value);
        const newVal = Math.min(250, current + 1);
        guestRange.value = newVal;
        guestBadge.textContent = newVal;
        recalcFormTotal();
        setTimeout(() => { suppressGuestSnap = false; }, 0);
      };
    }
    if (guestDown) {
      guestDown.onclick = () => {
        suppressGuestSnap = true;
        const current = Number(guestRange.value);
        const newVal = Math.max(0, current - 1);
        guestRange.value = newVal;
        guestBadge.textContent = newVal;
        recalcFormTotal();
        setTimeout(() => { suppressGuestSnap = false; }, 0);
      };
    }
  }
  const durRange = $('#event_duration_hours');
  const durBadge = $('#durationBadge');
  const durUp = $('#durationUp');
  const durDown = $('#durationDown');
  let suppressDurSnap = false;
  if (durRange && durBadge) {
    durBadge.textContent = durRange.value;
    durRange.oninput = () => {
      const rawValue = Number(durRange.value);
      if (!suppressDurSnap) {
        // Snap to multiples of 1 when dragging the slider
        const snappedValue = Math.round(rawValue);
        durRange.value = snappedValue;
        durBadge.textContent = snappedValue;
      } else {
        durBadge.textContent = rawValue;
      }
      recalcFormTotal();
    };
    if (durUp) {
      durUp.onclick = () => {
        suppressDurSnap = true;
        const current = Number(durRange.value);
        const newVal = Math.min(24, current + 0.5);
        durRange.value = newVal;
        durBadge.textContent = newVal;
        recalcFormTotal();
        setTimeout(() => { suppressDurSnap = false; }, 0);
      };
    }
    if (durDown) {
      durDown.onclick = () => {
        suppressDurSnap = true;
        const current = Number(durRange.value);
        const newVal = Math.max(0, current - 0.5);
        durRange.value = newVal;
        durBadge.textContent = newVal;
        recalcFormTotal();
        setTimeout(() => { suppressDurSnap = false; }, 0);
      };
    }
  }

  document.querySelectorAll('.cost-input').forEach(el=> el.oninput = recalcFormTotal);

  // bar toggle removed

  const addPhotosBtn = $('#addPhotos');
  if (addPhotosBtn) {
    addPhotosBtn.onclick = addPhotosClick;
  }
  // Title photo is chosen by clicking a thumbnail (no button).

  const closeDetailBtn = $('#closeDetail');
  if (closeDetailBtn) {
    closeDetailBtn.onclick = () => $('#detail').classList.add('hidden');
  }

  const searchEl = $('#search');
  if (searchEl) {
    searchEl.oninput = renderVenues;
  }

  const sortEl = $('#sort');
  if (sortEl) {
    sortEl.onchange = renderVenues;
  }

  const exportBtn = $('#exportBtn');
  if (exportBtn) {
    exportBtn.onclick = exportCSVClick;
  }

  const compareBtnEl = $('#compareBtn');
  if (compareBtnEl) {
    compareBtnEl.onclick = openCompareView;
  }

  const deleteSelectedBtnEl = $('#deleteSelectedBtn');
  if (deleteSelectedBtnEl) {
    deleteSelectedBtnEl.onclick = deleteSelectedVenues;
  }

  const closeCompareBtn = $('#closeCompare');
  if (closeCompareBtn) {
    closeCompareBtn.onclick = () => $('#compareModal').classList.add('hidden');
  }

  // Initialize drop zone handlers
  try { setupDropZone(); } catch (e) { console.warn('setupDropZone failed', e); }

  // Load venues
  await loadVenues();
}

async function addPhotosClick() {
  const paths = await api.openFileDialog();
  if (paths && paths.length) {
    for (const p of paths){ stagedPhotos.push({ isNew: true, localPath: p, isTitle: false }); }
    const pc = $('#photoCount'); if (pc) pc.textContent = stagedPhotos.length + ' photos';
    recalcFormTotal();
  }
}

async function exportCSVClick() {
  const rows = [];
  rows.push(['id','name','guest_count','event_duration_hours','venue_rental_cost','catering_per_person','catering_flat_fee','bar_service_type','bar_service_rate','bar_flat_fee','coordinator_fee','event_insurance','other_costs','total','per_guest','notes','created_at'].join(','));
  for (const v of venues) {
    const t = calcTotals(v);
    rows.push([v.id, escapeCSV(v.name), v.guest_count, v.event_duration_hours, v.venue_rental_cost, v.catering_per_person, v.catering_flat_fee, v.bar_service_type, v.bar_service_rate, v.bar_flat_fee, v.coordinator_fee, v.event_insurance, v.other_costs, t.total, t.perGuest, escapeCSV(v.notes || ''), v.created_at].join(','));
  }
  const csv = rows.join('\n');
  await api.exportCSV(csv);
}

function escapeCSV(s){ if(s==null) return ''; return '"'+String(s).replace(/"/g,'""')+'"'; }

// --- Tab and Drop-zone helpers ---


function setupDropZone(){
  const drop = document.getElementById('dropZone'); if (!drop) return;
  drop.addEventListener('click', async ()=>{ const paths = await api.openFileDialog({ properties:['openFile','multiSelections'], filters:[{name:'Images',extensions:['png','jpg','jpeg','gif']}] }); if (paths && paths.length) stageFilesFromPaths(paths.map(p=>({path:p}))); });
  drop.addEventListener('dragover', e=>{ e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', ()=> drop.classList.remove('dragover'));
  drop.addEventListener('drop', e=>{ e.preventDefault(); drop.classList.remove('dragover'); const dt = e.dataTransfer; if (!dt) return; const files = Array.from(dt.files || []); if (files.length) stageFilesFromPaths(files.map(f=>({ path: f.path }))); });
}

function stageFilesFromPaths(items){
  // items: [{path}] - push into stagedPhotos and refresh preview
  stagedPhotos = stagedPhotos || [];
  for (const it of items){ const src = it.path && it.path.startsWith('file://') ? it.path : `file://${it.path}`; stagedPhotos.push({ isNew: true, localPath: it.path, src, file_path: null, isTitle: false }); }
  const pc = $('#photoCount'); if (pc) pc.textContent = stagedPhotos.length + ' photos';
  recalcFormTotal();
}

// renderStagedPreviews is intentionally lightweight and relies on existing recalcFormTotal logic
function renderStagedPreviews(){
  const preview = $('#photoPreview'); if (!preview) return;
  preview.innerHTML = '';
  stagedPhotos.forEach((p, idx)=>{
    const wrapper = document.createElement('div'); wrapper.className='thumb';
    const img = document.createElement('img'); img.src = p.src || (p.localPath ? `file://${p.localPath}` : ''); img.alt='photo'; img.onclick = ()=>{ stagedPhotos.forEach(s=>s.isTitle=false); p.isTitle = true; recalcFormTotal(); };
    const btn = document.createElement('button'); btn.type='button'; btn.className='remove-photo'; btn.textContent='✕'; btn.onclick = ()=>{ stagedPhotos.splice(idx,1); const pc = $('#photoCount'); if (pc) pc.textContent = stagedPhotos.length + ' photos'; recalcFormTotal(); };
    if (p.isTitle) wrapper.classList.add('is-title'); wrapper.appendChild(img); wrapper.appendChild(btn); preview.appendChild(wrapper);
  });
}

function updateTitlePreviewFromStaged(){ const tp = document.getElementById('titlePhotoPreview'); if (!tp) return; tp.innerHTML=''; const chosen = stagedPhotos.find(p=>p.isTitle); if (chosen){ const img=document.createElement('img'); img.src = chosen.src || `file://${chosen.localPath}`; tp.appendChild(img); } }

function updateCompareButton() {
  const btn = $('#compareBtn');
  const count = $('#compareCount');
  const deleteBtn = $('#deleteSelectedBtn');
  const deleteCount = $('#deleteCount');
  
  if (!btn || !count) return;
  
  count.textContent = selectedForCompare.size;
  if (deleteCount) deleteCount.textContent = selectedForCompare.size;
  
  if (selectedForCompare.size >= 2) {
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
  
  if (selectedForCompare.size >= 1) {
    deleteBtn?.classList.remove('hidden');
  } else {
    deleteBtn?.classList.add('hidden');
  }
}

async function openCompareView() {
  if (selectedForCompare.size < 2) {
    alert('Please select at least 2 venues to compare');
    return;
  }
  if (selectedForCompare.size > 3) {
    alert('You can compare up to 3 venues at a time');
    return;
  }

  const modal = $('#compareModal');
  const content = $('#compareContent');
  if (!modal || !content) return;

  const selectedVenues = venues.filter(v => selectedForCompare.has(v.id)).map(v => {
    const t = calcTotals(v);
    return { ...v, catering: t.catering, bar: t.bar, total: t.total, perGuest: t.perGuest };
  });

  // Calculate best/worst for highlighting
  const metrics = ['venue_rental_cost', 'catering', 'bar', 'coordinator_fee', 'event_insurance', 'other_costs', 'total', 'perGuest'];
  const bestWorst = {};
  metrics.forEach(m => {
    const values = selectedVenues.map(v => Number(v[m] || 0));
    bestWorst[m] = { best: Math.min(...values), worst: Math.max(...values) };
  });

  // Build comparison grid
  const grid = document.createElement('div');
  grid.className = 'comparison-grid';
  // Set fixed columns: 1 for labels + number of venues
  grid.style.gridTemplateColumns = `180px repeat(${selectedVenues.length}, 300px)`;

  // Header row with venue names
  grid.innerHTML = '<div class="comparison-cell header">Venue</div>';
  for (const v of selectedVenues) {
    const cell = document.createElement('div');
    cell.className = 'comparison-cell venue-header';
    const h3 = document.createElement('h3');
    h3.textContent = v.name || 'Untitled';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${v.guest_count || 0} guests • ${v.event_duration_hours || 0} hrs`;
    cell.appendChild(h3);
    cell.appendChild(meta);
    grid.appendChild(cell);
  }

  // Photo row
  const photoHeader = document.createElement('div');
  photoHeader.className = 'comparison-cell header';
  photoHeader.textContent = 'Photo';
  grid.appendChild(photoHeader);
  
  const userData = await api.getUserDataPath();
  for (const v of selectedVenues) {
    const cell = document.createElement('div');
    cell.className = 'comparison-cell';
    const img = document.createElement('img');
    if (v.title_photo) {
      img.src = `file://${userData}/${v.title_photo}`;
    } else {
      const photos = await api.getPhotos(v.id);
      if (photos && photos[0]) {
        img.src = `file://${userData}/${photos[0].file_path}`;
      }
    }
    cell.appendChild(img);
    grid.appendChild(cell);
  }

  // Cost rows
  const rows = [
    ['Venue Rental', 'venue_rental_cost'],
    ['Catering', 'catering'],
    ['Bar Service', 'bar'],
    ['Coordinator Fee', 'coordinator_fee'],
    ['Event Insurance', 'event_insurance'],
    ['Other Costs', 'other_costs'],
    ['Total Cost', 'total'],
    ['Per Guest', 'perGuest']
  ];

  for (const [label, key] of rows) {
    const headerCell = document.createElement('div');
    headerCell.className = 'comparison-cell header';
    headerCell.textContent = label;
    grid.appendChild(headerCell);

    for (const v of selectedVenues) {
      const cell = document.createElement('div');
      cell.className = 'comparison-cell';
      const value = Number(v[key] || 0);
      cell.textContent = formatMoney(value);
      
      // Highlight best (lowest) and worst (highest)
      if (value === bestWorst[key].best && value > 0) {
        cell.classList.add('best');
      } else if (value === bestWorst[key].worst && selectedVenues.length > 1) {
        cell.classList.add('worst');
      }
      
      grid.appendChild(cell);
    }
  }

  content.innerHTML = '';
  content.appendChild(grid);
  modal.classList.remove('hidden');
}

async function deleteSelectedVenues() {
  if (selectedForCompare.size === 0) {
    alert('No venues selected');
    return;
  }
  
  const count = selectedForCompare.size;
  const venueNames = venues
    .filter(v => selectedForCompare.has(v.id))
    .map(v => v.name || 'Untitled')
    .join(', ');
  
  const confirmed = confirm(`Delete ${count} venue${count > 1 ? 's' : ''}?\n\n${venueNames}`);
  
  if (!confirmed) return;
  
  // Delete all selected venues
  for (const id of selectedForCompare) {
    await api.deleteVenue(id);
  }
  
  selectedForCompare.clear();
  updateCompareButton();
  loadVenues();
}

} // Close the initialization guard block
