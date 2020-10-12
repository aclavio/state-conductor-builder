module.exports = {
  'envelope-flow': {
    Comment: 'wraps things in an envelope',
    mlDomain: {
      context: [
        {
          scope: 'collection',
          value: 'envelope-test',
        },
      ],
    },
    StartAt: 'needs-envelope',
    States: {
      'needs-envelope': {
        Type: 'Task',
        Comment: 'makes the envelope',
        Resource: '/state-conductor/actions/custom/make-envelope.sjs',
        Next: 'needs-headers',
      },
      'needs-headers': {
        Type: 'Task',
        Comment: "makes the envelope's headers",
        Resource: '/state-conductor/actions/custom/make-headers.sjs',
        Next: 'needs-triples',
      },
      'needs-triples': {
        Type: 'Task',
        Comment: "makes the envelope's triples",
        Resource: '/state-conductor/actions/custom/make-triples.sjs',
        Next: 'success',
      },
      success: {
        Type: 'Succeed',
      },
    },
  },
  'branching-flow': {
    Comment: "example of a branching flow using a 'Choice' type state",
    mlDomain: {
      context: [
        {
          scope: 'collection',
          value: 'enrollee',
        },
      ],
    },
    StartAt: 'find-gender',
    States: {
      'find-gender': {
        Type: 'Choice',
        Comment: "determine's enrollee's gender",
        Choices: [
          {
            Resource:
              '/state-conductor/actions/custom/branching-test-flow/gender-is-male.sjs',
            Next: 'enroll-in-mens-health',
          },
          {
            Resource:
              '/state-conductor/actions/custom/branching-test-flow/gender-is-female.sjs',
            Next: 'enroll-in-womens-health',
          },
        ],
        Default: 'has-undetermined-gender',
      },
      'enroll-in-mens-health': {
        Type: 'Task',
        End: true,
        Comment: "adds enrollee to the men's health program",
        Resource:
          '/state-conductor/actions/custom/branching-test-flow/enroll-in-mens-health.sjs',
      },
      'enroll-in-womens-health': {
        Type: 'Task',
        End: true,
        Comment: "adds enrollee to the womens's health program",
        Resource:
          '/state-conductor/actions/custom/branching-test-flow/enroll-in-womens-health.sjs',
      },
      'has-undetermined-gender': {
        Type: 'Task',
        End: true,
        Comment: 'flags enrollee for follow-up',
        Resource:
          '/state-conductor/actions/custom/branching-test-flow/flag-for-follow-up.sjs',
      },
    },
  },
};
