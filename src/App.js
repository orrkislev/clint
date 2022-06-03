import './App.css';
import Sections from './components/Sections';
import Title from './components/TItle';
import Wrapper from './components/Wrapper';
import useScroll from './utils/useScroll';

function App() {
	const {scroll, setScroll} = useScroll();

	const section1 = [
		{ title: ['First, a path. a bezier curve.','paperjs is great with forming and editing vector paths.','','drawing style is made using lots of circles along the path, varing their size a bit with noise.'], 
		  images:['0-0','0-1','0-2','0-3'] },

		{ title: ['path offset has to be perpendicular to the path','this offers some challanges as paths were too wavy','also, a nice testing ground for different imagery.'], 
		  images:[0,1,3,4,5,7] },

		{ title: ['drawing arches between the offsets','arc is again a bezier curve with handles perpendicular to the path','','the arc is a bit more complex, but it is still a nice effect.'],
		  images:[9,'9-2',10,11] },
		  
		{ title: ['but what to do one form branch into two forms?','I can set up their spine and their offsets, but the form has to be a bit more complex'],
		  images:[12,13] },

		{ title: ['what happens when forms share the same "walls" ? ', 'they are all connected to each other, but they are not connected to each other.'],
		  images:[14,15,16] },

		{ title: ['forms are created by their "borders", and borders are emerge from "holes".','lets put some round holes.'],
		  images:[17,18,19,20] },
		{ title: ['arcs should be more affected by the holes','still start and and end handles of bezier curve, but now '],
		  images:[21,22,23,24] },
		{ title: ['underlying the result theres an initial path, a path the collides with the holes and borders, figuring the start and end points of arcs.','what if we play with the initial path direction and shape?','also, removing intersecting arcs leaves large gaps in the composition.'],
		  images:[25,26,27] },
		{ title: ['circular elements.','adding more points to bezier curves for arcs, testing the effect.'],
		  images:[28,29,30,31] },
		{ title: ['borders, and holes should not overlap','borders hitting other borders or holes just end, making the form to squish and end there'],
		  images:[32,33] },
		{ title: ['testing a different approach to overcome the gap issue.','arc ends push back toward the center of the composition, handles are relative to the radius of the arc','also debug mode (y) is born'],
		  images:[34,35] },
		{ title: ['something new!','border has thickness, hole and border are connected.','again paperjs with boolean operations on shapes is amazing.','','(took some time to figure out fillets)'],
		  images:[36,37,38,39] },
		{ title: ['finally no more gaps. each line is continuous, following path of borders and holes with fillets.'],
		  images:[41,42,43] ,singleImage:true},
		{ title: ['testing different layouts, colors and such'],
		  images:[44,45,46,47] ,singleImage:true},
	]

	return (
		<div className="App">
			<button onClick={() => setScroll(0)}>Home</button>
			<Wrapper>
				<Title x={0.4} y={0.4} start={-30} duration={60} text={["Making of Clint Fields."]} />
				<Title x={0.4} y={0.5} start={-30} duration={60} text={["Orr Kislev & Clint Fulkerson"]} />
			</Wrapper>
			<Sections data={section1}/>
		</div>
	);
}

export default App;
