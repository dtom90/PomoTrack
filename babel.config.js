module.exports = {
  presets: [
    ['@vue/app', {
      useBuiltIns: 'entry',
      polyfills: [
        'es.promise',
        'es.symbol'
      ]
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-private-property-in-object'
  ]
}
