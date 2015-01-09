module.exports = function(grunt) {

  grunt.initConfig({

    pkg : grunt.file.readJSON('package.json'),

    retire : {
      js      : ['index.js', 'Gruntfile.js', 'benchmark/*.js', 'bin/*.js',
                 'lib/*.js', 'lib/api/*.js', 'test/*.js', 'test/api/*.js'],
      // js      : ['index.js', 'Gruntfile.js', 'bin/*.js',
      //            'lib/*.js', 'lib/api/*.js', 'test/*.js' , 'test/api/*.js'],

      node    : ['./'],
      options : {
        verbose        : true,
        packageOnly    : true,
        jsRepository   : 'https://raw.github.com/bekk/retire.js/master/repository/jsrepository.json',
        nodeRepository : 'https://raw.github.com/bekk/retire.js/master/repository/npmrepository.json'
      }
    }
  });

  grunt.loadNpmTasks('grunt-retire');

};