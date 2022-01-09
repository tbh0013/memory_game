// ストリクトモード 厳密なエラーチェック
'use strict';   

/*--------------
    定義
--------------*/
// 山札52枚を作る(｢h1~h13,d1～...c13)の並びの52枚の山札)
// ハート、ダイヤ、スペード、クローバー
var marks = ['h','d','s','c'];
var decks = [];
for(var a = 0;a < marks.length;a++){
    for(var b = 0;b < 13; b++){
        decks.push(marks[a] + (b+1));
    }
}
console.log("山札:" + decks.length );
// 場に配布するカード
var field_cards = [];


//☆管理画面

// 管理画面の残枚数 
var decks_remove = decks.length;
// 管理画面のログに表示する〇回目
var charengeCount = 1;
//カードをめくった回数
var flipCard = 0;
//あたり回数
var hitCount = 0;
// はずれ回数
var falseCount = 0;

//カードの定義

//カード表面img
var card_surface = document.createElement('img');
//カード数字の配列化
var only_numbers = []; 
var elem_card_click = []
// 当たり判定
var hit = false;

// DOM関数
// var elem_number = document.querySelector('.number').lastElementChild.innerHTMLだと表示されなくなる為、
// 下部の関数内で都度innerHTMLを記述（リファクタリングの余地有り）
var elem_start = document.getElementById('start_btn');
var elem_card_list = document.getElementById('card_list');
var elem_log = document.getElementById('log');
var elem_number = document.querySelector('.number');
var elem_hit = document.querySelector('.hit');
var elem_false = document.querySelector('.false');
var elem_card_sheet = document.querySelector('.sheet');


/*--------------------
ゲームスタートボタン
--------------------*/
elem_start.addEventListener('click',function(){
    //発動したタイミングでclassを取得
    var elem_card_back = document.getElementsByClassName('card_back');//配列を渡す

    /*-----------------------------------------
    ↓↓↓ゲームスタート時の処理↓↓↓
    -----------------------------------------*/
    //管理画面の書き換え
    controlLocation();

    //再スタート用
    restart(elem_card_back);

    // 山札の数だけカードを配置する
    cardDisposition();

    // 山札から場への配置
    deckDisposition();

    /*-----------------------------------------
    ↓↓↓カードクリック後の処理↓↓↓
    -----------------------------------------*/
    //場に並んだカード52枚にクリックイベント設定
    for(let i = 0;i < elem_card_back.length;i++){
        elem_card_back[i].addEventListener('click', function() {
            
            //2カード選択済みで、3枚目のカードクリック後の処理
            threeSheetsCard(elem_card_back);

            //カード裏面クリック後に表面を表示させ、表面カードの情報を配列・ログに出力する処理
            cardSurface(i);

            //カードを2枚選んだら判定の処理
            twoSheetsCard();

            //カードオープン時に再度クリックさせない
            elem_card_back[i].classList.add("card_opened");
        });
    }
});

/*------------------
ゲームスタート時の処理
------------------*/
// 管理画面の書き換え（リファクタリングの余地有り）
function controlLocation() {
    elem_log.innerHTML = 'ゲームスタート！';
    elem_card_sheet.lastElementChild.innerHTML = decks_remove;
    elem_number.lastElementChild.innerHTML = flipCard;
    elem_hit.lastElementChild.textContent = hitCount;
    elem_false.lastElementChild.innerHTML = falseCount;
};

    
// 再スタート用   
function restart(elem_card_back){
    // classの数が0より大きい(=カードが配置されている時)の場合、card_listの子要素を無くなるまで削除する
    if(elem_card_back.length > 0){
        while(elem_card_list.firstChild){
        elem_card_list.removeChild(elem_card_list.firstChild);
        }
        // 選択したカードを空にする
        only_numbers = [];
        // 当たり判定を元に戻す
        hit = false
        
        // 管理画面を全てリセット
        decks_remove = decks.length;
        charengeCount = 1;
        hitCount, falseCount, flipCard  = 0
        elem_card_sheet.lastElementChild.innerHTML = decks_remove;
        elem_hit.lastElementChild.innerHTML = hitCount;
        elem_number.lastElementChild.innerHTML = flipCard;
        elem_false.lastElementChild.innerHTML = falseCount;
    }
}


// 山札の数だけカードを配置する
function cardDisposition() {
    for(var i = 0;i < decks.length;i++){
        var child = document.createElement('li');
        var image = document.createElement('img');
        child.className = 'card_back';
        image.className = 'card_click';
        image.src = 'img/trump_files/trump_ura.jpg';
        elem_card_list.appendChild(child);
        child.appendChild(image);
        
    }
};

// 山札から場への配置 
function deckDisposition(){
    // 場に配布するカードをリセット
    field_cards = [];
    // 山札を元に配布用の山札を作成
    var export_decks = decks.slice(0, decks.length); 
    // 山札の数(=52枚)だけ、配布用の山札から場にランダムに配置する。
    for(var i = 0; i < decks.length; i++){
        var random_index = Math.floor(Math.random() * export_decks.length);
        field_cards.push(export_decks[random_index]);
        export_decks.splice(random_index, 1);
    }
    console.log(field_cards);
};

/*------------------------------------------
↓↓↓カードクリック後の処理↓↓↓↓
------------------------------------------*/
// 2枚カード選択済みで、3枚目のカードクリック後の処理
function threeSheetsCard(elem_card_back){
    if(only_numbers.length == 2){
    
        // 当たり時
        if(hit == true){
            // 当たりの時のカードを消す処理(クラス追加、opacityで透明化＆クリック無効)
            for(var k =0; k < only_numbers.length; k++){
                delete field_cards[only_numbers[k].index];
                var remove_index = elem_card_back[only_numbers[k].index]
                remove_index.classList.add("card_remove");
                
            // 管理画面の残枚数を引く処理
            decks_remove -= 1;
            elem_card_sheet.lastElementChild.innerHTML = decks_remove;
            }
        
        // 配列削除確認
        console.log(field_cards);
        
        // はずれ時
        } else {
            // はずれの時のカードを戻す処理
            for(var l =0; l < only_numbers.length; l++){
                elem_card_back[only_numbers[l].index].firstChild.src = 'img/trump_files/trump_ura.jpg';
            }
            
        }
        
        
        //カードオープン時に再度クリック解除
        for(var j = 0;j < only_numbers.length; j++){
            elem_card_back[only_numbers[j].index].classList.remove('card_opened');
        }
        
        //管理画面のカードをめくった回数を足す処理
        flipCard++;
        elem_number.lastElementChild.innerHTML = flipCard;
        
        // 選択したカードを空にする
        only_numbers = [];
        // 当たり判定を元に戻す
        hit = false
    }
}

//カード裏面クリック後に表面を表示させ、表面カードの情報を配列に代入・ログに出力する処理
function cardSurface(i) {
    //表面表示
    let imageNo =  field_cards[i]; 
    card_surface.src = 'img/trump_files/'+imageNo+'.png';
    elem_card_click = document.getElementsByClassName('card_click')[i] 
    elem_card_click.src = card_surface.src;
    
    //カードの数字だけ取り出す 
    var only_number = (imageNo.replace(/[^0-9]/g, '')); 

    //配列に連想配列挿入(カードの数字とindex)
    var card_number_index =  
    {
        'number' : only_number,
        'index' : i
    };
    only_numbers.push(card_number_index);
    console.log(only_numbers);
    //ログの最下部に選択したカードを追加していく
    var cardSymbol_j = imageNo.replace('h', 'ハート').replace('s','スペード').replace('d','ダイヤ').replace('c','クローバー');
    elem_log.insertAdjacentHTML('beforeend','<p>'+charengeCount+'回目： '+cardSymbol_j+' カードが表面になったよ！</p>');
    elem_log.scrollTop = elem_log.scrollHeight;
};

// カードを2枚選んだら判定の処理
function twoSheetsCard() {
    if(only_numbers.length == 2){
        console.log('2枚選んだ後の処理');
        /*------------ ↓カードの数値が一致していたら当たり、一致なしはずれ:-----------*/
        if(only_numbers[0].number == only_numbers[1].number){
            // 一致した場合
            hit = true;
            console.log('当たり');
            
            // 管理画面の当たりのカウントを増やす
            hitCount ++ ;
            elem_hit.lastElementChild.innerHTML = hitCount;
            
            // 場に残った最後の2枚が揃ったときの処理
            if(hitCount == 26) {
                elem_log.insertAdjacentHTML('beforeend', 'ゲーム終了！');
                // 残枚数を0、当たりの枚数を足す
                elem_card_sheet.lastElementChild.innerHTML = 0
                flipCard++;
                elem_number.lastElementChild.innerHTML = flipCard;
                
            } else{
                
                // 管理画面ログに当たり表記を追加
                elem_log. insertAdjacentHTML('beforeend', '当たり！次のカードをめくろう！');
            }
            // 一致しなかった場合
        } else{
            hit = false;
            console.log('はずれ');
            //管理画面のはずれカウンターを増やす
            falseCount ++ ;
            elem_false.lastElementChild.innerHTML = falseCount;
            
            //管理画面ログにはずれ表記を追加
            elem_log.insertAdjacentHTML('beforeend', 'はずれ！次のカードをめくろう！');
        }
        
        // 管理画面ログの〇回目の回を増やす
        charengeCount++
        // スクロール最下部に移動
        elem_log.scrollTop = elem_log.scrollHeight;
    }
    
};
