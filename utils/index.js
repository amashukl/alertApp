const pug = require('pug');
const fs = require('fs');

Array.prototype.groupBy = function(prop) {
  return this.reduce(function(groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}

const compilePug = (relativeTemplatePath, data, next) => {
  pug.renderFile(relativeTemplatePath, data, function(err, compiledTemplate){
    if(err){
      throw new Error('Problem compiling template(double check relative template path): ' + relativeTemplatePath);
    }
    console.log('[INFO] COMPILED TEMPLATE: ', compiledTemplate)
    next(null, compiledTemplate);
  });

};

module.exports = {
  compilePug
};
