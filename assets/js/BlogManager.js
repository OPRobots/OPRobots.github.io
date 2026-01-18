var BlogManager = function () {

    let fillSidebar = function (data) {

        $.each(data, function (i, keyObj) {
            let key = keyObj.text;
            if (keyObj.isAllPosts) {
                if (keyObj.nodes.length === 0) {
                    $('.sidebar').parent().remove();
                    return;
                }
            }
        });

        $('.sidebar').treeview({
            data: data,
            levels: 2,
            collapseIcon: "fa fa-caret-down",
            expandIcon: "fa fa-caret-right",
            enableLinks: true
        });

        document.addEventListener('click', event => {
            const link = event.target.closest('a[href="#"]');
            if (link === null) {
                return;
            }
            event.preventDefault();
        });

    }

    let fillRecentPosts = function (data) {
        let $wrapper = $(".recent-posts");
        if (!$wrapper.length) {
            return;
        }

        let recentPosts = [];
        $.each(data, function (i, keyObj) {
            let key = keyObj.text;
            if (keyObj.isAllPosts) {
                $.each(keyObj.nodes, function (i, monthObj) {
                    let month = monthObj.text;
                    $.each(monthObj.nodes, function (i, postObj) {
                        recentPosts.push(postObj);
                    });
                })
            }
        });
        $wrapper.empty();
        if (recentPosts.length === 0) {
            $wrapper.append("<p class='my-5'>Aun no tenemos publicaciones, pero estamos trabajando en ellas.</p>");
            return;
        }
        $.each(recentPosts.reverse().slice(0, 6), function (i, post) {
            $wrapper.append(`
                                <div class="card mb-3 cursor-pointer" onclick="location.href='`+ post.href + `';">
                                    <div class="row no-gutters">
                                        <div class="col-md-4" style="background-image: url('../../../assets/img/blog/img-placeholder.png'), url('`+ post.image + `');
                                background-repeat: no-repeat;background-size: cover;background-position: center;">
                                        </div>
                                        <div class="col-md-8">
                                            <div class="card-body">
                                                <h5 class="card-title">`+ post.text + `</h5>
                                                <p class="card-text">`+ post.resume + `</p>
                                                <p class="card-text text-right"><a href="`+ post.href + `">Leer más...</a></small></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                `)

        });

    }

    let loadPosts = function (jsonURL = "blog.json") {
        $.ajax(
            {
                type: "GET",
                url: jsonURL,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {

                    $.each(data, function (i, keyObj) {
                        let key = keyObj.text;
                        $.each(keyObj.nodes, function (i, monthObj) {
                            let month = monthObj.text;
                            $.each(monthObj.nodes, function (i, postObj) {
                                let href = postObj.href
                                let image = postObj.image
                                postObj.href = "/blog/" + month + "/" + href;
                                postObj.image = "../../../assets/img/blog/" + month + "/" + href + "/" + image;
                            });
                        })
                    })

                    fillSidebar(data);
                    fillRecentPosts(data);
                },

                error: function (msg) {
                    console.log("error");
                    console.log(msg.responseText);
                }
            });
    }

    let fixCodeHighlight = function () {
        let dataTypes = [
            "int", "int8_t", "int16_t", "int32_t", "uint8_t", "uint16_t", "uint32_t",
            "float", "double", "char", "void", "bool", "size_t"
        ];

        $(".token.keyword").each(function () {
            let text = $(this).text();
            if (dataTypes.includes(text)) {
                $(this).removeClass("keyword").addClass("datatype");
            }
        });

    }
    return {
        init: function (jsonURL) {
            loadPosts(jsonURL);

            fixCodeHighlight();

        }
    }

}();