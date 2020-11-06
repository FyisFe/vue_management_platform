const productionPlugin = []
if (process.env.NODE_ENV === 'production') {
  productionPlugin.push('transform-remove-console')
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    ...productionPlugin,
    '@babel/plugin-syntax-dynamic-import'
  ]
}
