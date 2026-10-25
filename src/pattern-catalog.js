// Project-supplied artwork. Originals remain unchanged; thumbnails only help browsing.
export const suppliedPatterns = [
 {id:'blue-butterfly-frame',name:'蓝蝶团花',file:'blue-butterfly-frame.png',note:'蓝紫蝴蝶围绕团花，对称的卷叶连接四方。'},
 {id:'four-butterfly-floral',name:'蝶舞花环',file:'four-butterfly-floral.png',note:'四只蓝蝶与枝叶花环围绕中心，展开层层花序。'},
 {id:'geometric-butterfly',name:'蓝蝶几何纹',file:'geometric-butterfly.png',note:'几何蝶翼与同心圆层层相接，勾勒蓝青色的节奏。'},
 {id:'colorful-butterfly',name:'彩蝶花境',file:'colorful-butterfly.png',note:'明亮的蝶翼容纳多种形象，四周点缀花叶与卷纹。'},
 {id:'single-butterfly',name:'紫蓝蝶翼',file:'single-butterfly.png',note:'一只蓝紫蝴蝶舒展双翼，与四周花纹相互呼应。'},
 {id:'indigo-floral',name:'蓝白花蝶',file:'indigo-floral.jpg',note:'白色花叶与蝴蝶在蓝底上交织，形成清晰的对称纹理。'},
 {id:'colorful-circle',name:'彩色环纹',file:'colorful-circle.jpg',note:'彩色圆环、三角与菱形相接，形成鲜明的几何节奏。'},
 {id:'green-bird-floral',name:'青绿花鸟',file:'green-bird-floral.jpg',note:'青绿底色中，花鸟与金色线条围绕中心舒展。'}
].map(({file,...pattern})=>({...pattern,image:`assets/patterns/${file}`,thumbnail:`assets/patterns/thumbnails/${pattern.id}.webp`,source:'项目提供'}));
