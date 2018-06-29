import React, {Component} from 'react';
import ReactFauxDom from 'react-faux-dom';
import d3 from 'd3';
import classNames from 'classnames';

import styles from './TeamVisualization.scss';

export default class TeamVisualization extends Component {
	
	constructor(props) {
		super(props);

		this.createTeamVisualization = this.createTeamVisualization.bind(this);
	}


	createTeamVisualization() {

		const node = ReactFauxDom.createElement('div');

		const svg = d3.select(node).append('svg')
			.attr({
				width: 800,
				height: 100,
				class: 'team-visualization'
			});
		const xScale = this.props.scale;

		svg.selectAll('circle')
			.data(this.props.teamData.players)
			.enter()
			.append('circle')
				.attr({
					cx: d => {
						return xScale(d[this.props.criteria])
					},
					cy: 50,
					r: 20,
					class: 'team-player'
				});

		// svg.selectAll('circle.team-player')
		// 	.transition()
		// 	.attr({
		// 		delay: (d,i) => {return 500*i},
		// 		duration: (d,i) => {return 500*i},
		// 		cx: d => {return xScale(d[this.props.cirteria])}

		// 	})


		return node.toReact();
	}

	render() {
		return (
			<div>
				
				<div>
					<div className="country-name country-section"> { this.props.teamData.country }</div>
					<div className="country-visualization country-section">
						{ this.createTeamVisualization() }
					</div>
				</div>
			</div>
		);
	}
}