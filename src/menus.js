import crel from 'crel'
import Cellular from './nodes/cellular'
//import Random from './nodes/random'
//import BigCanvas from './nodes/bigcanvas'
//import Custom from './nodes/Custom'

const nodeTypes = [Cellular] // Random, BigCanvas, Custom]
let count = 0 // Node IDs

export const createNodeMenu = () => {
	const element = crel(
		'div',
		{
			class: 'menu-item',
			on: {
				click: (e) => {},
			},
		},
		'Delete node'
	)

	element.hidden = true
	return element
}
//export const nodeMenu = createNodeMenu()

export const createLeftClickMenu = (nodes) => {
	const els = []
	let element
	nodeTypes.forEach((node) => {
		els.push(
			crel(
				'div',
				{
					class: 'menu-item',
					on: {
						click: (e) => {
							element.hidden = true
							console.log(element.hidden)
							const newNode = new node(
								{ x: e.pageX + 'px', y: e.pageY + 'px' },
								count
							)
							nodes.push(newNode)
							count++
						},
					},
				},
				node.name
			)
		)
	})

	element = crel('div', { id: 'menu' }, [...els])
	element.hidden = true
	return element
}

//export const contextMenu = createLeftClickMenu()

export const toggleMenu = (e, menu) => {
	console.log(menu.hidden)
	if (!menu.hidden) return (menu.hidden = true)
	//x and y position of mouse or touch
	//mouseX represents the x-coordinate of the mouse
	let mouseX = e.clientX || e.touches[0].clientX
	//mouseY represents the y-coordinate of the mouse.
	let mouseY = e.clientY || e.touches[0].clientY
	//height and width of menu
	//getBoundingClientRect() method returns the size of an element and its position relative to the viewport
	let menuHeight = menu.getBoundingClientRect().height
	let menuWidth = menu.getBoundingClientRect().width
	//width and height of screen
	//innerWidth returns the interior width of the window in pixels
	let width = window.innerWidth
	let height = window.innerHeight
	//If user clicks/touches near right corner
	if (width - mouseX <= 200) {
		menu.style.borderRadius = '5px 0 5px 5px'
		menu.style.left = width - menuWidth + 'px'
		menu.style.top = mouseY + 'px'
		//right bottom
		if (height - mouseY <= 200) {
			menu.style.top = mouseY - menuHeight + 'px'
			menu.style.borderRadius = '5px 5px 0 5px'
		}
	}
	//left
	else {
		menu.style.borderRadius = '0 5px 5px 5px'
		menu.style.left = mouseX + 'px'
		menu.style.top = mouseY + 'px'
		//left bottom
		if (height - mouseY <= 200) {
			menu.style.top = mouseY - menuHeight + 'px'
			menu.style.borderRadius = '5px 5px 5px 0'
		}
	}
	menu.hidden = false
}
