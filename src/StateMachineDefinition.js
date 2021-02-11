class StateMachineState {
  constructor(name, def = {}, drawing = {}) {
    this.name = name;
    this.def = def;
    this.drawing = drawing;
    this.node = {
      data: {
        id: name,
        name: name,
        comment: def.Comment,
        type: def.Type,
      },
      position: {
        x: drawing.x || 0,
        y: drawing.y || 100,
      },
      classes: [def.Type],
      locked: def.Type === 'Start',
    };
  }

  get type() {
    return this.def.Type;
  }

  get comment() {
    return this.def.Comment;
  }

  toJson() {
    return this.def;
  }

  getNode() {
    return this.node;
  }

  getEdges(includeCatches = true) {
    const edges = [];
    if (includeCatches && this.def.Catch) {
      this.def.Catch.forEach((c) => {
        edges.push({
          data: {
            id: `${this.name}-${c.Next}`,
            source: this.name,
            target: c.Next,
          },
          classes: ['error'],
        });
      });
    }

    if ('Choice' === this.def.Type) {
      if (this.def.Default) {
        edges.push({
          data: {
            id: `${this.name}-${this.def.Default}`,
            source: this.name,
            target: this.def.Default,
          },
        });
      }
      this.def.Choices.forEach((choice) => {
        edges.push({
          data: {
            id: `${this.name}-${choice.Next}`,
            source: this.name,
            target: choice.Next,
          },
        });
      });
    } else if ('Fail' !== this.def.Type && 'Succeed' !== this.def.Type) {
      if (!this.def.End) {
        edges.push({
          data: {
            id: `${this.name}-${this.def.Next}`,
            source: this.name,
            target: this.def.Next,
          },
        });
      }
    }
    return edges;
  }

  setNext(next) {
    if ('Choice' === this.def.Type) {
      this.def.Default = next;
    } else if ('Task' === this.def.Type) {
      this.def.End = false;
      this.def.Next = next;
    } else if ('Fail' !== this.def.Type && 'Succeed' !== this.def.Type) {
      this.def.Next = next;
    }
  }
}

class StateMachineDefinition {
  constructor(name, def = {}) {
    this.name = name;
    this.def = def;
    this.comment = def.Comment;
    this.mlDomain = def.mlDomain;
    this.startAt = def.StartAt;
    let drawing = this.mlDomain.drawing || {};

    this.states = Object.entries(def.States).map(
      ([key, val]) => new StateMachineState(key, val, drawing[key])
    );

    this.states.push(
      new StateMachineState(
        'START',
        {
          Type: 'Start',
          Next: def.StartAt,
        },
        {
          x: 0,
          y: 1,
        }
      )
    );
  }

  toJson() {
    return {
      Comment: this.def.Comment,
      mlDomain: this.def.mlDomain,
      StartAt: this.def.StartAt,
      States: this.states.reduce((acc, state) => {
        acc[state.name] = state.toJson();
        return acc;
      }, {}),
    };
  }

  stateNames() {
    return this.states.map((state) => state.name);
  }

  getNodes() {
    const nodes = this.states.map((state) => state.getNode());
    return nodes;
  }

  getStateByName(name) {
    const matches = this.states.filter((state) => state.name === name);
    return matches.length > 0 ? matches[0] : null;
  }

  getEdges(includeCatches = true) {
    let edges = [];
    this.states.forEach((state) => {
      edges = edges.concat(state.getEdges(includeCatches));
    });
    return edges;
  }
}

export default StateMachineDefinition;
