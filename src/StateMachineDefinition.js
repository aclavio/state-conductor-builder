function getStateMachineSkeleton() {
  return {
    Comment: '',
    mlDomain: {
      context: [],
      drawing: {
        'New Task': {
          x: 0,
          y: 100,
        },
      },
    },
    StartAt: 'New Task',
    States: {
      'New Task': {
        Type: 'Task',
        Comment: '',
        Resource: '',
        Next: '',
        End: true,
      },
    },
  };
}

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
        end: def.Type === 'Task' ? def.End : undefined,
      },
      position: {
        x: !isNaN(parseFloat(drawing.x))
          ? parseFloat(drawing.x)
          : Math.random() * 1000 - 500,
        y: !isNaN(parseFloat(drawing.y))
          ? parseFloat(drawing.y)
          : Math.random() * 1000 - 500,
      },
      classes: [def.Type],
      locked: def.Type === 'Start',
    };
    this.dirty = false;
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
      if (Array.isArray(this.def.Choices)) {
        this.def.Choices.filter((choice) => !!choice.Next).forEach((choice) => {
          edges.push({
            data: {
              id: `${this.name}-${choice.Next}`,
              source: this.name,
              target: choice.Next,
            },
          });
        });
      }
    } else if ('Fail' !== this.def.Type && 'Succeed' !== this.def.Type) {
      if (!this.def.End && this.def.Next) {
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
    this.dirty = true;
  }

  removeEdgesTo(name) {
    if (this.def.Catch) {
      this.def.Catch.forEach((c) => {
        c.Next = c.Next !== name ? c.Next : null;
      });
    }
    if ('Choice' === this.def.Type) {
      this.def.Default = this.def.Default !== name ? this.def.Default : null;
      if (Array.isArray(this.def.Choices)) {
        this.def.Choices.forEach((c) => {
          c.Next = c.Next !== name ? c.Next : null;
        });
      }
    } else if ('Fail' !== this.def.Type && 'Succeed' !== this.def.Type) {
      this.def.Next = this.def.Next !== name ? this.def.Next : null;
    }
  }
}

class StateMachineDefinition {
  constructor(name, def) {
    def = def || getStateMachineSkeleton();
    this.name = name;
    this.def = def;
    this.comment = def.Comment;
    this.mlDomain = def.mlDomain;
    this.startAt = def.StartAt;

    this.mlDomain.drawing = this.mlDomain.drawing || {};
    let drawing = this.mlDomain.drawing;

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
          y: 0,
        }
      )
    );

    this.dirty = false;
  }

  toJson() {
    return {
      Comment: this.def.Comment,
      mlDomain: this.def.mlDomain,
      StartAt: this.def.StartAt,
      States: this.states
        .filter((state) => state.type !== 'Start')
        .reduce((acc, state) => {
          acc[state.name] = state.toJson();
          return acc;
        }, {}),
    };
  }

  isDirty() {
    return this.dirty || this.states.filter((state) => this.dirty).length > 0;
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

  addState(name, data, loc) {
    const names = this.stateNames();
    if (!names.includes(name)) {
      const state = new StateMachineState(name, data, loc);
      this.states.push(state);
      this.dirty = true;
      return state.getNode();
    } else {
      console.warn(`a state with name "${name}" already exists`);
    }
    return null;
  }

  removeState(name) {
    const names = this.stateNames();
    if (names.includes(name)) {
      this.states = this.states.filter((state) => state.name !== name);
      this.states.forEach((state) => state.removeEdgesTo(name));
      this.startAt = this.startAt !== name ? this.startAt : null;
      this.dirty = true;
    } else {
      console.warn(`no state with name "${name}" found`);
    }
  }

  setNodePosition(name, x, y) {
    const drawing = this.mlDomain.drawing;
    drawing[name] = {
      x: x,
      y: y,
    };
    this.dirty = true;
  }

  updateNodePositions(drawing) {
    this.mlDomain.drawing = drawing;
    this.dirty = true;
  }
}

export default StateMachineDefinition;
