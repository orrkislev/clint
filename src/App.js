import './App.css';
import Sections from './components/Sections';
import Sketch from './components/Sketch';
import Title from './components/TItle';
import Wrapper from './components/Wrapper';

function App() {
	const section1 = [
		{ title: [	'f(x)ield drawings start with a path, a bezier curve. Paper.js is useful for forming and editing vector paths.','',
					'Each line is composed of many circles of varying size laid along the path.'], 
		  images:['0-0','0-1','0-2','0-3'] },

		{ title: ['In order to make parallel lines follow curves, the path offset has to be perpendicular. This presents a challenge and opportunity to explore different visualizations.'], 
		  images:[0,1,3,4,5,7] },

		{ title: ['Arcs are drawn between the offsets, again using bezier curves.'],
		  images:[9,'9-2',10,11] },
		  
		{ title: ['But what to do when one form branches into two? I can set up their spine and offsets, but the form has to be a bit more complex.'],
		  images:[12,13] },

		{ title: ['What happens when one form shares the same “walls”? They are all connected visually, but they are not connected to each other.'],
		  images:[14,15,16] },

		{ title: ['The lines grow in sequence and encounter holes that they must accomodate, thereby creating emergent forms.'],
		  images:[17,18,19,20] },
		{ title: ['The arc lines need to be more responsive to the holes.'],
		  images:[21,22,23,24] },
		{ title: ['underlying the initial path, there is a path that collides with holes and borders, figuring the start and end points of arcs. What if we play with the initial path direction and shape?','',
					'Also, removing intersecting arcs leaves large gaps in the composition.'],
		  images:[25,26,27] },
		{ title: ['Testing more circular elements and experimenting with more points on the bezier curves'],
		  images:[28,29,30,31] },
		{ title: ['To ensure borders and holes do not overlap, they are coded to end or squish out of existence.'],
		  images:[32,33] },
		{ title: ['Testing a different approach to overcome the gap issue by pushing arc ends toward the center of the composition and basing curves on the arc radius. Also, debug mode (y) is born.'],
		  images:[34,35] },
		{ title: ['Eureka! The border has a thickness and holes connect. Did I mention how amazing paperjs is with boolean operations and shapes?'],
		  images:[36,37,38,39] },
		{ title: ['Finally, no more gaps. Each line is continuous, following the path of the borders and meeting at the holes nice fillets. '],
		  images:[41,42,43] ,singleImage:true, centered:true},
		{ title: ['testing different layouts, colors, textures, edges, and compositions.'],
		  images:[44,45,46,] ,singleImage:true, centered:true},
		{ title: ['thank you ♥'],	
		  images:[47,48,49,51] ,singleImage:true, centered:true},
	]

	return (
		<div className="App">
			<Wrapper>
				<Sketch filename={'hero'} x={.1} y={.1} duration={65} start={-10} className="image-large"/>
				<Title x={0.05} y={0.2} start={-30} duration={60} text={["Making of F(x)ields."]} className="nice-font"/>
				<Title x={0.05} y={0.3} start={-30} duration={60} text={["Orr Kislev & Clint Fulkerson"]} className="smaller-text"/>
			</Wrapper>
			<Sections data={section1}/>
		</div>
	);
}

export default App;
