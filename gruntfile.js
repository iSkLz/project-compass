module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),		
        copy: {
            default: {
                files: [
                    {
                        expand: true,
                        cwd: "src",
                        src: "html/png/ico/json/js/txt/ttf/mjs/d.ts"
                            .split("/").map(ext => `**/*.${ext}`),
                        dest: "build/",
                        rename(dest, src) {
                            return dest + src.toLowerCase();
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
                            return dest + src.replace("lib.scss", "css");
                        }
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-sass");

    grunt.task.registerTask("default", ["copy:default", "sass:default"]);
}