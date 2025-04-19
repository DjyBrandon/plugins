(function () {
    'use strict';
    const url = "https://raw.githubusercontent.com/DjyBrandon/plugins/refs/heads/main/google-scholar/COMPUTER%20SCIENCE(Sheet1).csv"
    const decoder = new TextDecoder('utf-8');
    fetch(url)
        .then(response => {
            const reader = response.body.getReader();
            let array = []
            let database = []
            return reader.read().then(function process({ done, value }) {
                if (done) {
                    // console.log('Stream finished');
                    for (let i = 0; i < array.length; i++) {
                        if (!array[i]["Journal title"] || i == array.length - 1) {
                            showSpan(database)
                            return
                        }
                        database.push(array[i])
                    }
                    return
                }

                // 解码数据
                const text = decoder.decode(value);

                // console.log('Received text chunk', text);
                Papa.parse(text, {
                    header: true,
                    complete: function (results) {
                        array = [...array, ...results.data]
                        // console.log(results.data);
                    }
                });

                return reader.read().then(process);
            });
        })
        .catch(console.error);
})();


function showSpan(database) {
    let style = document.createElement("style")
    style.innerHTML = `
    .span{
        background-color:pink;
        border-radius:9px;
        padding:3px 9px 2px 9px;
        font-family:"Times New Roman", sans-serif !important;
        white-space:nowrap;
        margin:1px;
    }

    .span:nth-child(n+2):nth-child(-n+4) {
        background-color: #CBE5FE;
    }

    .span:nth-child(n+5):nth-child(-n+6) {
        background-color: #FFE8C8;
    }
    
    .divBox{
        display:flex;
        flex-wrap: wrap;
    }
    `
    $("body").append(style)

    let allPaperDiv = $("#gs_res_ccl_mid > div > div.gs_ri");
    allPaperDiv.each(function () {
        let pattern = /- .*?(?=, [0-9]{4})/;
        // ['- 中国预防兽医学报', input: '童光志， 周艳君， 郝晓芳， 田志军， 仇华吉， 彭金美… - 中国预防兽医学报, 2007']
        let journal = $(this).find("div.gs_a").text().match(pattern);
        let hrefName = journal[0].substring(2).toUpperCase(); // 中国预防兽医学报

        let divBox = document.createElement("div")
        divBox.classList.add("divBox")
        $(this).children("h3").after(divBox)

        // 有三个点,就先记录一下，稍后处理三个点
        new Promise((resolve, reject) => {
            if (hrefName.indexOf("…") !== -1) {
                $(this).children("h3").attr("pointFlag", "true")
                let code = $(this).parent().attr("data-cid")
                let url = "https://" + document.location.hostname + "/scholar?q=info:" + code +
                    ":scholar.google.com/&output=cite&scirp=0&hl=zh-CN";
                $.get(url, function (data) {
                    var div = $("<div class='temp'></div>");
                    $("body").append(div);
                    $(".temp").append(data)
                    let temp = $(".temp").find("tr");
                    $.each(temp, function () {
                        if ($(this).find("th.gs_cith").text() == "MLA" || $(this).find(
                            "th.gs_cith").text() == "APA") {
                            let title = $(this).find("div.gs_citr i").first().text().toUpperCase();
                            hrefName = title
                            // let span = document.createElement("div")
                            // $(span).addClass("span")
                            // $(divBox).append(span)
                            // $(span).text(title)
                            createSpan(divBox, hrefName)
                            return false;
                        }
                    });
                    $('.temp').remove()
                    resolve()
                })
            } else {
                // 直接把期刊名称标记上
                // let span = document.createElement("div")
                // $(span).addClass("span")
                // $(divBox).append(span)
                // $(span).text(hrefName)
                createSpan(divBox, hrefName)
                resolve()
            }
        }).then(() => {
            let data = database.find(item => {
                return item["Journal title"] == hrefName
            })

            if (!data) {
                return false
            }
            createSpan(divBox, data["SciVal Top %"])
            createSpan(divBox, data.CAS)
            createSpan(divBox, data.REF)
            createSpan(divBox, "", data["Official website"])
            createSpan(divBox, "", "", data["Submission website"])
        })
    })
}


function createSpan(divBox, text, OfficialWebsite, SubmissionWebsite) {
    let span = document.createElement("div")
    $(span).addClass("span")
    $(divBox).append(span)
    if (OfficialWebsite) {
        let a = document.createElement("a")
        a.target = "_blank"
        $(a).text("Official Website")
        a.href = OfficialWebsite
        $(span).append(a)
    } else if (SubmissionWebsite) {
        let a = document.createElement("a")
        a.target = "_blank"
        $(a).text("Submission Website")
        a.href = SubmissionWebsite
        $(span).append(a)
    } else {
        $(span).text(text)
    }

}


// computing nash equilibria and evolutionarily stable states