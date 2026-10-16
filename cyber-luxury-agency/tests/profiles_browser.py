"""Cross-app same-origin profile and storage regression tests."""
from pathlib import Path
import functools,http.server,threading,unittest,os
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2]
class Profiles(unittest.TestCase):
 def test_profiles(self):
  server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)))
  threading.Thread(target=server.serve_forever,daemon=True).start()
  try:
   with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox'])
    context=browser.new_context();page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    ids=[];names=[]
    for app in ['cyber-luxury-agency','galactic-hypercars']:
     noir=app.startswith('cyber');base=f'http://127.0.0.1:{server.server_port}/{app}/'
     page.goto(base)
     if noir:
      expect(page.locator('#age-gate')).to_be_visible();page.locator('#adult-check').check();page.locator('#enter').click();page.locator('#login-button').click()
     else:page.locator('#accountButton').click()
     page.locator('[data-action=generate-user]').last.click()
     pin=page.locator('[name=pin]');expect(pin).to_have_attribute('type','password')
     pin.fill('0000');page.locator('#generate-form button[type=submit]' if noir else '#generateForm button[type=submit]').click()
     expect(page.locator('#modal-error' if noir else '#generateForm .error')).to_contain_text('PIN')
     module='./core.js' if noir else './storage.js'
     read="async()=>{const d=await import('./storage.js');return "+("await new Promise((resolve,reject)=>{const r=indexedDB.open('noir-prive-demo',2);r.onsuccess=()=>{const db=r.result,q=db.transaction('state').objectStore('state').get('app');q.onsuccess=()=>{db.close();resolve(q.result.users)};q.onerror=()=>reject(q.error)}})" if noir else "await d.generatedUsers()")+";}"
     self.assertEqual(page.evaluate(read),[])
     page.locator('[data-action=close]').last.click()
     self.assertEqual(page.evaluate(read),[])
     (page.locator('#login-button') if noir else page.locator('#accountButton')).click();page.locator('[data-action=generate-user]').last.click();pin.fill('1111');page.locator('#generate-form button[type=submit]' if noir else '#generateForm button[type=submit]').click()
     page.wait_for_function("()=>!document.querySelector('"+('#modal' if noir else '#dialog')+"').open")
     records=page.evaluate(read);first=records[0];name=first['name' if noir else 'username'];names.append(name);self.assertRegex(name,r'^[0-9A-F]{8}$')
     ids.append(page.evaluate("async()=> (await import('"+module+"')).PROGRAM_ID"))
     if noir:
      result=page.evaluate("async()=>{const d=await import('./core.js'),{DemoStore}=await import('./storage.js'),s=new DemoStore();await s.open();await s.mutate(x=>{x.favorites=['NP-0001'];d.wallet(x,123);});const b=(await s.mutate(x=>d.generateUser(x,'1111'))).result;await s.mutate(x=>{if(x.favorites.length)throw Error('shared favorites');d.selectUser(x,x.users[0].id)});const x=await s.read();s.close();return [x.favorites.length,d.currentUser(x).balance];}")
      self.assertEqual(result,[1,25123])
     else:
      result=page.evaluate("async()=>{const d=await import('./storage.js'),a=(await d.generatedUsers())[0];await d.updateProfile(a.id,{favorites:['WT-0001'],theme:'gold'});const b=await d.generateUser('1111');if((await d.profile(b.id)).favorites.length)throw Error('shared favorites');await d.selectUser(a.id);return (await d.profile(a.id)).favorites.length;}")
      self.assertEqual(result,1)
     page.reload();expect(page.locator('#login-button' if noir else '#accountButton')).to_contain_text(name)
     collision=page.evaluate("async()=>{const d=await import('"+module+"'),original=crypto.getRandomValues.bind(crypto);let n=0;crypto.getRandomValues=a=>{a.fill(n++<2?0:255);return a};try{"+("const {DemoStore}=await import('./storage.js'),s=new DemoStore();await s.open();const a=(await s.mutate(x=>d.generateUser(x,'1111'))).result,b=(await s.mutate(x=>d.generateUser(x,'1111'))).result;s.close();return [a.name,b.name];" if noir else "const a=await d.generateUser('1111'),b=await d.generateUser('1111');return [a.username,b.username];")+"}finally{crypto.getRandomValues=original}}")
     self.assertEqual(collision,['00000000','FFFFFFFF'])
    self.assertNotEqual(ids[0],ids[1]);self.assertEqual(errors,[])
    browser.close()
  finally:server.shutdown();server.server_close()
if __name__=='__main__':unittest.main()
