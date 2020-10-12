exports.parseFlowFile = function (input) {
  let nodes = [];
  let edges = [];
  let catches = [];
  let drawing = Object.assign({}, input.mlDomain.drawing);
  nodes.push({
    data: {
      id: 'START',
      name: 'START',
    },
    position: { x: 10, y: 10 },
    locked: true,
  });
  edges.push({
    data: {
      id: `START-${input.StartAt}`,
      source: 'START',
      target: input.StartAt,
    },
  });
  if (input.States) {
    let stateNames = Object.keys(input.States);
    stateNames.forEach((stateName) => {
      let state = input.States[stateName];
      nodes.push({
        data: {
          id: stateName,
          name: stateName,
          comment: state.Comment,
          type: state.Type,
        },
        position: drawing[stateName] || { x: 20, y: 20 },
        classes: [state.Type],
      });

      if (state.Catch) {
        state.Catch.forEach((catche) => {
          catches.push({
            data: {
              id: `${stateName}-${catche.Next}`,
              source: stateName,
              target: catche.Next,
            },
            classes: ['error'],
          });
        });
      }

      if ('Task' === state.Type) {
        if (!state.End) {
          edges.push({
            data: {
              id: `${stateName}-${state.Next}`,
              source: stateName,
              target: state.Next,
            },
          });
        }
      } else if ('Choice' === state.Type) {
        if (state.Default) {
          edges.push({
            data: {
              id: `${stateName}-${state.Default}`,
              source: stateName,
              target: state.Default,
            },
          });
        }
        state.Choices.forEach((choice) => {
          edges.push({
            data: {
              id: `${stateName}-${choice.Next}`,
              source: stateName,
              target: choice.Next,
            },
          });
        });
      } else if ('Wait' === state.Type) {
        edges.push({
          data: {
            id: `${stateName}-${state.Next}`,
            source: stateName,
            target: state.Next,
          },
        });
      }
    });
  }
  return {
    nodes,
    edges,
    catches,
  };
};
