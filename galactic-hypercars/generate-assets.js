import {generateCatalog,illustration} from './catalog.js';
import {writeFileSync,mkdirSync} from 'node:fs';
const vehicles=generateCatalog();
mkdirSync('assets',{recursive:true});
// One static SVG sheet per 25 cars, three native view fragments per car.
// View fragments are ordinary img resources: no scripts or external requests.
for(let start=0;start<1000;start+=25){let parts=[];for(let j=0;j<25;j++){const v=vehicles[start+j];for(let angle=0;angle<3;angle++){const y=(j*3+angle)*450,svg=decodeURIComponent(illustration(v,angle).split(',')[1]),prefix=v.id+'-'+angle+'-';const inner=svg.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'').replace(/id="([^"]+)"/g,(_,id)=>`id="${prefix}${id}"`).replace(/url\(#([^\)]+)\)/g,(_,id)=>`url(#${prefix}${id})`);parts.push(`<view id="${v.id}-${angle}" viewBox="0 ${y} 800 450"/><g transform="translate(0,${y})">${inner}</g>`);}}writeFileSync(`assets/fleet-${start/25}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">${parts.join('')}</svg>`);}
writeFileSync('catalog-data.js','// Public immutable initial catalog. Generated with seed 30006820.\nexport default '+JSON.stringify(vehicles)+';\n');
console.log('Generated 1000 catalog records and 3000 static SVG views in 40 sheets.');
