import Database from 'better-sqlite3';
const db = new Database('data/gtfs.db', {readonly:true});
console.log('patterns totali', db.prepare('SELECT COUNT(*) c FROM route_patterns').get().c);
console.log('patterns con shape_id', db.prepare("SELECT COUNT(*) c FROM route_patterns WHERE shape_id IS NOT NULL AND shape_id<>''").get().c);
console.log('patterns con shape presente in shapes', db.prepare("SELECT COUNT(*) c FROM route_patterns rp JOIN shapes s ON s.shape_id=rp.shape_id").get().c);
const r = db.prepare("SELECT rp.route_id, rp.direction_id, rp.shape_id, length(s.polyline) len FROM route_patterns rp JOIN shapes s ON s.shape_id=rp.shape_id ORDER BY len DESC LIMIT 3").all();
console.log('polyline piu lunghe:', r);
const stats = db.prepare("SELECT AVG(length(polyline)) a, MAX(length(polyline)) m FROM shapes").get();
console.log('lunghezza polyline media/max (caratteri)', stats);
