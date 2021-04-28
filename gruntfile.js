module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        
        ts: {
            default: {
                tsconfig: "./tsconfig.json"
            },
            web: {
                tsconfig: "./tsconfig-web.json"
            }
        },
		
        copy: {
            default: {
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: "html/png/json/js/txt"
                            .split("/").map(ext => `**/*.${ext}`),
                        dest: "build/",
                        rename(dest, src) {
                            return dest + src;
                        }
                    }
                ]
            }
        },

        sass: {
            default: {
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: "**/*.lib.scss",
                        dest: "build/",
                        rename(dest, src) {
                            return dest + src.replace("lib.scss", "scss");
                        }
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-ts");

    grunt.task.registerTask("default", ["copy:default", "sass:default"]);
}