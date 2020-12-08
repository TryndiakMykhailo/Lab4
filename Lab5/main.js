// var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ .,-\';:?!^|'; 
var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ .,-;:'; 
var alphabet_indexes = [];
var KEY_WORD = "MELNYKARS";
var key_matrix = [];

var main_letters = [];

function alphabet_index() {
    for (var i = 0; i < alphabet.length; i++) {
        alphabet_indexes[alphabet[i]] = i;
    }

    var count = 0;
    for (var i = 0; i < 3; i++) {
        key_matrix[i] = [];
        for (var j = 0; j < 3; j++) {
            key_matrix[i][j] = alphabet_indexes[KEY_WORD[count++]];
        }
    }

}

function multy_matrix(first_m, second_m) {
    var new_matrix = [];
    for (var i = 0; i < 3; i++) {
        var sum = 0;
        for (var j = 0; j < 3; j++) {
            sum += first_m[j] * second_m[j][i];
        }
        new_matrix[i] = sum % alphabet.length;
    }

    return new_matrix;
}

var d, x, y;
function gcdext(a, b) {
    var s;
    if (b == 0) {
        d = a; 
        x = 1; 
        y = 0;

        return;
    }

    gcdext(b, a % b);

    s = y;
    y = parseInt(x - (a / b) * (y));
    x = s;
}

function Determinant(A) {   // Используется алгоритм Барейса, сложность O(n^3) (Определитель матрицы)
    var N = A.length, B = [], denom = 1, exchanges = 0;
    for (var i = 0; i < N; ++i){ 
        B[i] = [];
        for (var j = 0; j < N; ++j) 
            B[i][j] = A[i][j];
    }
    for (var i = 0; i < N - 1; ++i) { 
        var maxN = i, 
        maxValue = Math.abs(B[i][i]);
        for (var j = i+1; j < N; ++j) { 
            var value = Math.abs(B[j][i]);
            if (value > maxValue) { 
                maxN = j; 
                maxValue = value; 
            }
        }
        if (maxN > i){ 
            var temp = B[i]; 
            B[i] = B[maxN]; 
            B[maxN] = temp;
            ++exchanges;
        }
        else { 
            if (maxValue == 0) 
                return maxValue; 
        }
        var value1 = B[i][i];
        for (var j = i+1; j < N; ++j) { 
            var value2 = B [j][i];
            B[j][i] = 0;
            for (var k = i + 1; k < N; ++k) 
                B[j][k] = (B[j][k] * value1 - B[ i ][k] * value2) / denom;
        }
        denom = value1;
    }
    if (exchanges %2 ) 
        return -B[N - 1][N - 1];
    else 
        return B[N - 1][N - 1];
}

//Алгебраические дополнения
function AdjugateMatrix(A) {                                       
    var N = A.length, adjA = [];
    for (var i = 0; i < N; i++) { 
        adjA[i] = [];
        for (var j = 0; j < N; j++) { 
            var B = [], sign = ((i + j) % 2 == 0) ? 1 : -1;
            for (var m = 0; m < j; m++) { 
                B[m] = [];
                for (var n = 0; n < i; n++) {  
                    B[m][n] = A[m][n]; 
                }
                for (var n = i + 1; n < N; n++) {
                    B[m][n - 1] = A[m][n]
                };
            }
            for (var m = j + 1; m < N; m++) { 
                B[m - 1] = [];
                for (var n = 0; n < i; n++) {
                    B[m - 1][n] = A[m][n];
                }
                for (var n = i + 1; n < N; n++) { 
                    B[m - 1][n - 1] = A[m][n];
                }
            }
            adjA[i][j] = sign * Determinant(B);
        }
    }
    return adjA;
}

function decrypt_click() {
    KEY_WORD = $('#key').val();
    var text_matrix_first = [];
    var text_matrix_decode = [];

    KEY_WORD = $('#key').val();
    var text = $('#text').val();

    text = text.toUpperCase();

    alphabet_index();

    while (text.length % 3 !== 0) {
        text += " ";
    }
    $('#text').val(text);
    //First Step
    var count = 0;
    for (var i = 0; i < text.length / 3; i++) {
        text_matrix_first[i] = [];
        for (var j = 0; j < 3; j++) {
            text_matrix_first[i][j] = alphabet_indexes[text[count++]];
        }
    }

    var det = key_matrix;
    //Second Step - Находим определитель матрицы ключа a11·a22·a33 + a12·a23·a31 + a13·a21·a32 - a13·a22·a31 - a11·a23·a32 - a12·a21·a33
    var det_first = (det[0][0] * det[1][1] * det[2][2]) + (det[0][1] * det[1][2] * det[1][1]) + (det[0][2] * det[1][0] * det[2][1]) - 
    (det[0][2] * det[1][1] * det[2][0]) - (det[0][0] * det[1][2] * det[2][1]) - (det[0][1] * det[1][0] * det[2][2]);

    //3-th Step - Теперь по расширенному алгоритму Евклида находим d, x, y.
    gcdext(det_first, alphabet.length);

    //4-th Step - найти обратный детерминанту элемент в кольце по модулю 33 (длина алфавита)
    var un_det = 0; 
    if (det_first < 0 && x >= 0) {
        un_det = x;
    }
    else if (det_first >= 0 && x < 0) {
        un_det = alphabet.length + x;
    }
    else if (det_first >= 0 && x >= 0) {
        un_det = x;
    }
    else if (det_first < 0 && x < 0) {
        un_det = x * (-1);
    }

    //5-th Step - найти матрицу обратную матрицу
    var aMatrix = AdjugateMatrix(key_matrix);

    aMatrix = aMatrix[0].map((col, i) => aMatrix.map(row => row[i]));

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            aMatrix[i][j] = aMatrix[i][j] % alphabet.length; 
        }
    }

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            aMatrix[i][j] = aMatrix[i][j] * un_det; 
        }
    }

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            aMatrix[i][j] = aMatrix[i][j] % alphabet.length;  
        }
    }

    aMatrix = aMatrix[0].map((col, i) => aMatrix.map(row => row[i]));

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (aMatrix[i][j] < 0)
                aMatrix[i][j] += alphabet.length;
        }
    }

    //6-th Step - розшифрування
    var text_matrix_decode = [];
    for (var i = 0; i < text.length / 3; i++) {
        text_matrix_decode[i] = [];
        text_matrix_decode[i] = multy_matrix(text_matrix_first[i], aMatrix);
    }

    var text_encode = "";
    for (var i = 0; i < text_matrix_decode.length; i++) {
        for (var j = 0; j < 3; j++) {
            text_encode += alphabet[text_matrix_decode[i][j]];
        }
    }
    $('#text_decrypt').val(text_encode);
    setTimeout(main_func, 0);
    setTimeout(main_func2, 0);
}

function encrypt_click() {
    var text_matrix_first = [];
    var text_matrix_encode = [];

    KEY_WORD = $('#key').val();
    var text = $('#text').val();

    text = text.toUpperCase();
    $('#text').val(text);

    alphabet_index();

    while (text.length % 3 !== 0) {
        text += " ";
    }

    var count = 0;
    for (var i = 0; i < text.length / 3; i++) {
        text_matrix_first[i] = [];
        for (var j = 0; j < 3; j++) {
            text_matrix_first[i][j] = alphabet_indexes[text[count++]];
        }
    }

    for (var i = 0; i < text.length / 3; i++) {
        text_matrix_encode[i] = [];
        text_matrix_encode[i] = multy_matrix(text_matrix_first[i], key_matrix);
    }

    var text_encode = "";
    for (var i = 0; i < text_matrix_encode.length; i++) {
        for (var j = 0; j < 3; j++) {
            text_encode += alphabet[text_matrix_encode[i][j]];
        }
    }

    $('#text_decrypt').val(text_encode);
    setTimeout(main_func, 0);
    setTimeout(main_func2, 0);
}


var ctx1 = document.getElementById('myChart').getContext('2d');
var ctx2 = document.getElementById('myChart2').getContext('2d');
var ctx3 = document.getElementById('myChart3').getContext('2d');
var ctx4 = document.getElementById('myChart4').getContext('2d');
var ctx5 = document.getElementById('myChart5').getContext('2d');
var ctx6 = document.getElementById('myChart6').getContext('2d');
var ctx7 = document.getElementById('myChart7').getContext('2d');
var ctx8 = document.getElementById('myChart8').getContext('2d');

var first_chart = show_chart(ctx1);
var second_chart = show_chart(ctx2);

var thirt_chart = show_chart(ctx3);
var fourth_chart = show_chart(ctx4);

var fifth_chart = show_chart(ctx5);
var sixth_chart = show_chart(ctx6);

var seventh_chart = show_chart(ctx7);
var eight_chart = show_chart(ctx8);

var colors = random_rgba();

var main_letters = [];


function main_func() {
    var str = $('#text').val();
    str = str.toUpperCase();

    var chars = [];
    var chars_letter = [];
    var chars_b = [];
    var chars_letter_b = [];
    var chars_t = [];
    var chars_letter_t = [];
    var pair = '';
    for (var i = 0; i < str.length; i++) {
        if (i > 0) {
            pair = (str[i - 1] == " " ? "\\s" : str[i - 1]) + (str[i] == " " ? "\\s" : str[i]);
            if (!chars_letter_b[pair]) {
                chars_b.push(1);
                chars_letter_b[pair] = chars_b.length;
            }
            else {
                chars_b[chars_letter_b[pair] - 1]++;
            }
        }

        if (i > 1) {
            pair = (str[i - 2] == " " ? "\\s" : str[i - 2]) + (str[i - 1] == " " ? "\\s" : str[i - 1]) + (str[i] == " " ? "\\s" : str[i]);
            if (!chars_letter_t[pair]) {
                chars_t.push(1);
                chars_letter_t[pair] = chars_t.length;
            }
            else {
                chars_t[chars_letter_t[pair] - 1]++;
            }
        }

        if (!chars_letter[str[i]]) {
            chars.push(1);
            chars_letter[str[i]] = chars.length;
        }
        else {
            chars[chars_letter[str[i]] - 1]++;
        }
    }

    var other_chars = [];
    $('#text').val(str);

    if (chars_letter[" "]) {
        chars_letter["\\s"] = chars_letter[" "];
        delete chars_letter[" "];
    }

    if (chars_letter_b[" "]) {
        chars_letter_b["\\s"] = chars_letter_b[" "];
        delete chars_letter_b[" "];
    }

    if (chars_letter_t[" "]) {
        chars_letter_t["\\s"] = chars_letter_t[" "];
        delete chars_letter_t[" "];
    }

    setTimeout(sort_letters, 0, first_chart, chars, chars_letter, Object.keys(chars_letter).sort()); 
    setTimeout(sort_by_count, 0, thirt_chart, chars_letter, Object.keys(chars_letter), chars); 
    setTimeout(sort_by_count, 0, fifth_chart, chars_letter_b, Object.keys(chars_letter_b), chars_b, 15); 
    setTimeout(sort_by_count, 0, seventh_chart, chars_letter_t, Object.keys(chars_letter_t), chars_t, 15); 
}

function main_func2() {
    var str = $('#text_decrypt').val();
    str = str.toUpperCase();

    var chars = [];
    var chars_letter = [];
    var chars_b = [];
    var chars_letter_b = [];
    var chars_t = [];
    var chars_letter_t = [];
    var pair = '';
    for (var i = 0; i < str.length; i++) {
        if (i > 0) {
            pair = (str[i - 1] == " " ? "\\s" : str[i - 1]) + (str[i] == " " ? "\\s" : str[i]);
            if (!chars_letter_b[pair]) {
                chars_b.push(1);
                chars_letter_b[pair] = chars_b.length;
            }
            else {
                chars_b[chars_letter_b[pair] - 1]++;
            }
        }

        if (i > 1) {
            pair = (str[i - 2] == " " ? "\\s" : str[i - 2]) + (str[i - 1] == " " ? "\\s" : str[i - 1]) + (str[i] == " " ? "\\s" : str[i]);
            if (!chars_letter_t[pair]) {
                chars_t.push(1);
                chars_letter_t[pair] = chars_t.length;
            }
            else {
                chars_t[chars_letter_t[pair] - 1]++;
            }
        }

        if (!chars_letter[str[i]]) {
            chars.push(1);
            chars_letter[str[i]] = chars.length;
        }
        else {
            chars[chars_letter[str[i]] - 1]++;
        }
    }

    var other_chars = [];
    $('#text_decrypt').val(str);

    if (chars_letter[" "]) {
        chars_letter["\\s"] = chars_letter[" "];
        delete chars_letter[" "];
    }

    if (chars_letter_b[" "]) {
        chars_letter_b["\\s"] = chars_letter_b[" "];
        delete chars_letter_b[" "];
    }

    if (chars_letter_t[" "]) {
        chars_letter_t["\\s"] = chars_letter_t[" "];
        delete chars_letter_t[" "];
    }

    setTimeout(sort_letters, 0, second_chart, chars, chars_letter, Object.keys(chars_letter).sort()); 
    setTimeout(sort_by_count, 0, fourth_chart, chars_letter, Object.keys(chars_letter), chars); 
    setTimeout(sort_by_count, 0, sixth_chart, chars_letter_b, Object.keys(chars_letter_b), chars_b, 15); 
    setTimeout(sort_by_count, 0, eight_chart, chars_letter_t, Object.keys(chars_letter_t), chars_t, 15); 
}

function sort_letters(chart, chars, chars_letter, chars_temp) {
    var letters = [];
    var others = [];
    for (var i = 0; i < chars_temp.length; i++) {
        if( chars_temp[i].toUpperCase() != chars_temp[i].toLowerCase() ) {
            letters.push(chars_temp[i]);
        }
        else {
            others.push(chars_temp[i]);
        }
    }

    main_letters = letters.concat(others);

    show_chars_by_values(chart, letters.concat(others), chars, chars_letter);
}

function sort_by_count(chart, chars_letter, chars_temp, count, count_for) {
    let len = chars_temp.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            if (count[chars_letter[chars_temp[j]] - 1] < count[chars_letter[chars_temp[j + 1]] - 1]) {
                let tmp = chars_temp[j];
                chars_temp[j] = chars_temp[j + 1];
                chars_temp[j + 1] = tmp;
            }
        }
    }
    show_chars_by_values(chart, chars_temp, count, chars_letter, count_for);
}

function random_rgba() {
    var colors = [];
    for (var i = 0; i < 32; i++) {
        var o = Math.round, r = Math.random, s = 255;
        colors.push('rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')');
    }

    return colors;
}

function show_chars_by_values (chart, sort_chars, chars, chars_letter, count_for) {
    var value = [];
    var color = [];
    var count = 0;
    count_for = count_for || sort_chars.length;
    for (var i = 0; i < count_for; i++) {
        value.push(chars[chars_letter[sort_chars[i]] - 1]);
        color.push(colors[count++]);
    }

    changeDataset(chart, sort_chars.slice(0, count_for), value, color);
}

function show_chart(ctx) {
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '# of Votes',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    return myChart;
}

function addData(chart, label, data, color) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
        dataset.backgroundColor.push(color);
    });
    chart.update();
}

function changeDataset(chart, labels, dataset, colors) {
    chart.config.data.datasets[0].data = dataset;
    chart.config.data.labels = labels;
    chart.config.data.datasets[0].backgroundColor = colors;
    chart.update();
}
