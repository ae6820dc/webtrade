"""Real Chromium integration tests. Requires Python Playwright, no app dependencies."""
import base64
import functools
import http.server
import json
import os
from pathlib import Path
import tempfile
import threading
import unittest
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
RESULTS = Path(os.environ.get('NOIR_TEST_RESULTS', tempfile.gettempdir() + '/noir-test-results'))
READ = """async () => { const db = await new Promise((res,rej)=>{let r=indexedDB.open('noir-prive-demo',2);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}); const data=await new Promise((res,rej)=>{let r=db.transaction('state').objectStore('state').get('app');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});db.close();return data;}"""
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_): pass
class BrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        RESULTS.mkdir(parents=True, exist_ok=True)
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}/'
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.pw.stop();cls.server.shutdown();cls.server.server_close()
    def setUp(self):
        self.context=self.browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True)
        self.page=self.context.new_page();self.errors=[]
        self.page.on('pageerror',lambda e:self.errors.append(str(e)))
        self.page.goto(self.url);expect(self.page.locator('#age-gate')).to_be_visible()
    def tearDown(self):
        self.page.screenshot(path=str(RESULTS/(self._testMethodName+'.png')),full_page=True)
        self.context.close();self.assertEqual(self.errors,[])
    def enter(self):
        self.page.locator('#adult-check').check();self.page.locator('#enter').click();expect(self.page.locator('.card')).to_have_count(12)
    def click(self,action,id=None,scope=None):
        selector=f'[data-action="{action}"]'+(f'[data-id="{id}"]' if id else '')
        (scope or self.page).locator(selector).first.click()
    def demo(self,role):
        if not self.page.locator(f'[data-action="demo-login"][data-id="{role}"]').count():
            self.page.locator('nav a[href="#account"]').click()
        self.click('demo-login',role)
        expect(self.page.locator('.screen-title .eyebrow')).to_contain_text({'customer':'ÜGYFÉL','advertiser':'HIRDETŐ','admin':'ADMINISZTRÁTOR'}[role])
    def state(self): return self.page.evaluate(READ)
    def test_01_age_gate_and_layout(self):
        expect(self.page.locator('#enter')).to_be_disabled();self.page.keyboard.press('Escape');expect(self.page.locator('#age-gate')).to_be_visible()
        self.page.locator('#decline').click();expect(self.page.locator('#age-error')).to_contain_text('elutasítva')
        self.enter();self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        self.page.set_viewport_size({'width':390,'height':844});self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        self.page.screenshot(path=str(RESULTS/'mobile.png'),full_page=True)
        self.page.set_viewport_size({'width':1440,'height':1000});self.page.screenshot(path=str(RESULTS/'desktop.png'),full_page=True)
        self.assertTrue(self.page.locator('.card img').evaluate_all('(imgs)=>imgs.every(i=>i.complete&&i.naturalWidth>0)'))
    def test_02_discovery_favorites_compare_and_persistence(self):
        self.enter();self.page.locator('#city').select_option('Budapest');self.page.locator('#search-form button[type="submit"]').click()
        self.assertTrue(self.page.locator('.card .location').evaluate_all('(els)=>els.every(x=>x.textContent.includes("Budapest"))'))
        self.click('advanced');self.page.locator('#minAge').fill('30');self.page.locator('#maxAge').fill('45');self.page.locator('#search-form button[type="submit"]').click()
        self.click('save-search');expect(self.page.locator('.saved-row')).to_be_visible()
        self.click('favorite',scope=self.page.locator('.card').first);self.page.locator('[data-compare]').first.check()
        self.page.reload();expect(self.page.locator('#fav-count')).to_have_text('1');expect(self.page.locator('.compare-dock')).to_contain_text('1/4')
        self.click('compare');expect(self.page.locator('table')).to_contain_text('Demóellenőrzés')
        self.click('remove-compare');expect(self.page.locator('.empty')).to_contain_text('Válassz')
        self.click('favorites',scope=self.page) if self.page.locator('[data-action="favorites"]').count() else self.page.locator('nav a[href="#favorites"]').click()
        expect(self.page.locator('#main')).to_contain_text('kedvenceid')
    def test_03_gallery_messages_reports_and_notifications(self):
        self.enter();self.demo('customer');self.page.locator('nav a[href="#discover"]').click();self.click('profile','NP-0001');m=self.page.locator('#modal')
        first=m.locator('#gallery-image').get_attribute('src');m.locator('.gallery-thumbs button').nth(1).click()
        self.assertNotEqual(first,m.locator('#gallery-image').get_attribute('src'))
        self.click('message','NP-0001',m);m.locator('#message').fill('Milyen galériát választanál?');m.locator('button[type="submit"]').click();expect(m.locator('.message.demo')).to_contain_text('automatikus válasz')
        self.click('close',scope=m);self.click('notifications');expect(m).to_contain_text('szimulált válasz');self.click('close',scope=m)
        self.click('profile','NP-0001');self.click('report','NP-0001',m);m.locator('#reportText').fill('Fiktív tesztjelentés.');m.locator('button[type="submit"]').click();expect(m).not_to_be_visible();self.assertEqual(len(self.state()['reports']),1)
    def test_04_registration_checkout_receipt_cancel_wallet(self):
        self.enter();self.click('login');self.click('register',scope=self.page.locator('#modal'));m=self.page.locator('#modal')
        m.locator('#name').fill('Fiktív Ügyfél');m.locator('#handle').fill('browser-customer');m.locator('#password').fill('demo-password');m.locator('[name="adult"]').check();m.locator('button[type="submit"]').click();expect(m).not_to_be_visible()
        self.assertEqual(self.state()['users'][0]['balance'],25000)
        self.page.locator('nav a[href="#discover"]').click();self.click('profile','NP-0001');self.click('book','NP-0001',m)
        day=self.page.evaluate("async ()=>{let D=await import('./core.js');let p=(await (await fetch('./profiles.json')).json())[0];return Array.from({length:10},(_,i)=>new Date(Date.now()+i*86400000).toISOString().slice(0,10)).find(d=>D.availableSlots(p,d).length)}")
        m.locator('#date').fill(day);m.locator('#time').select_option('14:00');m.locator('#duration').select_option('2');m.locator('#time').select_option('14:00');m.locator('#code').fill('PRIVE10');m.locator('button[type="submit"]').click();expect(m).to_contain_text('Virtuális végösszeg')
        self.click('pay',scope=m);expect(m.locator('#modal-error')).to_contain_text('fogadd el');m.locator('#payment-consent').check();self.click('pay',scope=m);expect(m).to_contain_text('Visszaigazolt szimuláció')
        s=self.state();self.assertEqual(len(s['bookings']),1);b=s['bookings'][0];self.assertEqual(s['users'][0]['balance'],25000-b['total']);self.assertEqual(b['total'],5175)
        with self.page.expect_download() as dl:self.click('receipt',scope=m)
        self.assertIn('NOIR-DEMO',dl.value.suggested_filename)
        self.click('history',scope=m);self.click('cancel-confirm');self.click('cancel',scope=m);expect(m).not_to_be_visible();self.assertEqual(self.state()['users'][0]['balance'],25000)
        self.click('wallet');m.locator('#amount').fill('5000');m.locator('button[type="submit"]').click();expect(m).to_contain_text('30');self.assertEqual(self.state()['users'][0]['balance'],30000)
        self.click('close',scope=m);self.page.reload();expect(self.page.locator('.screen-title')).to_contain_text('Fiktív');self.assertEqual(self.state()['users'][0]['balance'],30000)
    def test_05_advertiser_admin_campaign_and_categories(self):
        self.enter();self.demo('advertiser');self.click('new-ad');m=self.page.locator('#modal')
        m.locator('#name').fill('Fiktív Aurora Atelier');m.locator('#bio').fill('Eredeti fiktív felnőtt karakter vagyok; galériák, jazz és kortárs design inspirálnak.');m.locator('[name="categories"]').first.check();m.locator('[name="fictional"]').check();m.locator('button[type="submit"]').first.click();expect(m).not_to_be_visible();expect(self.page.locator('#main')).to_contain_text('Ellenőrzésre vár')
        ad=self.state()['ads'][0];self.click('promote-confirm',ad['id']);self.click('promote',ad['id'],m);expect(m).not_to_be_visible();self.assertEqual(self.state()['users'][0]['balance'],24000)
        self.demo('admin');self.click('account-tab','moderation');self.page.locator('#adminQuery').fill('Aurora');self.page.locator('#admin-search button[type="submit"]').click();self.click('approve',ad['id']);expect(self.page.locator('#main')).to_contain_text('Jóváhagyva')
        self.click('account-tab','campaigns');self.page.locator('#code').fill('TEST15');self.page.locator('#discount').fill('15');self.page.locator('#campaign-form button[type="submit"]').click();expect(self.page.locator('#main')).to_contain_text('TEST15');self.click('toggle-campaign','TEST15');self.assertFalse(next(c for c in self.state()['campaigns'] if c['code']=='TEST15')['active'])
        self.page.locator('#categoryName').fill('Fiktív design séta');self.page.locator('#category-form button[type="submit"]').click();self.click('delete-category','Fiktív design séta');self.assertNotIn('Fiktív design séta',self.state()['categories'])
        for tab in ['overview','reports','reviews','finance','audit']:self.click('account-tab',tab);expect(self.page.locator('#main .panel')).not_to_have_count(0)
        self.click('account-tab','moderation');self.page.locator('#adminQuery').fill('Aurora');self.page.locator('#admin-search button[type="submit"]').click();self.click('suspend',ad['id']);expect(self.page.locator('#main')).to_contain_text('Felfüggesztve')
    def test_06_indexeddb_concurrency_migration_corruption_and_backup(self):
        self.enter();self.demo('customer')
        balances=self.page.evaluate("""async()=>{const {DemoStore}=await import('./storage.js');const D=await import('./core.js');const a=new DemoStore(),b=new DemoStore();await a.open();await b.open();await Promise.all([a.mutate(s=>D.wallet(s,100)),b.mutate(s=>D.wallet(s,200))]);let value=(await a.read()).users[0].balance;a.close();b.close();return value;}""")
        self.assertEqual(balances,25300);self.page.reload();expect(self.page.locator('.screen-title')).to_be_visible()
        self.click('backup');m=self.page.locator('#modal')
        with self.page.expect_download() as dl:self.click('export',scope=m)
        path=RESULTS/'backup.json';dl.value.save_as(str(path));self.assertEqual(json.loads(path.read_text())['users'][0]['balance'],25300)
        self.click('reset-confirm',scope=m);self.click('reset',scope=m);expect(m).not_to_be_visible();self.assertEqual(self.state()['users'],[])
        self.click('backup');m.locator('#backupFile').set_input_files(str(path));m.locator('[name="replace"]').check();m.locator('button[type="submit"]').click();expect(m).not_to_be_visible();self.assertEqual(self.state()['users'][0]['balance'],25300)
        self.page.evaluate("""async()=>{let r=indexedDB.open('noir-prive-demo',2);await new Promise(res=>{r.onsuccess=res});let db=r.result;await new Promise(res=>{let tx=db.transaction('state','readwrite');tx.objectStore('state').put({version:2,users:'corrupt'},'app');tx.oncomplete=res});db.close()}""")
        self.page.reload();expect(self.page.locator('.notice')).to_contain_text('Sérült demóadatot');self.assertEqual(self.state()['users'],[])
        self.click('backup')
        with self.page.expect_download() as dl:self.click('recovery-export',scope=m)
        self.assertIn('corrupt',dl.value.suggested_filename)
    def test_07_membership_empty_states_and_data_reset(self):
        self.enter();self.demo('customer');self.page.locator('nav a[href="#membership"]').click();self.click('membership-confirm','gold');self.click('buy-membership','gold',self.page.locator('#modal'));expect(self.page.locator('#modal')).not_to_be_visible();self.assertEqual(self.state()['users'][0]['membership'],'gold')
        self.page.locator('nav a[href="#account"]').click()
        for tab in ['bookings','transactions','messages']:self.click('account-tab',tab);expect(self.page.locator('#main .panel')).not_to_have_count(0)
        self.click('logout');expect(self.page.locator('#main')).to_contain_text('Lépj be')
        self.page.locator('nav a[href="#discover"]').click();self.page.locator('#q').fill('NO-SUCH-PROFILE');self.page.locator('#search-form button[type="submit"]').click();expect(self.page.locator('.empty')).to_contain_text('Nincs ilyen találat')
        self.click('legal');expect(self.page.locator('#modal')).to_contain_text('Nincs bankkártyaadat');self.click('close',scope=self.page.locator('#modal'))

if __name__=='__main__': unittest.main(verbosity=2)
