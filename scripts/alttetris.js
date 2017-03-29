        /*
         *        Alter Tetris
         *         Howard Xu
         *        Jan. 29, 2017
         */

function lstorage(n) {
  try {
    if (typeof(Storage) !== 'undefined') {
      if (n > 0) localStorage.setItem('bestscore', n)
      else if (localStorage.getItem('bestscore') != null)
        n = localStorage.getItem('bestscore')
    }
  }
  catch(err) {
    console.log(err)
  }
    return n
}

function AltTetris(e0, e1, e2, e3, msg) {

  this.savescore = function(n) {
    return lstorage(n)
  }

  this.doscore = function() {
    if (this.sc[0] < this.sc[1]) {
      this.sc[0] += 20
      this.msg.innerHTML = this.sc[2] + this.sc[0]
      setTimeout(ldoscore, 60)
    }
    else {
      this.disp()
      this.showscore(this.sc[1])
    }
  }

  this.showscore = function(score) {
    this.tls[0].innerHTML = "Score: " + score
    if (this.best < score) 
      this.best = this.savescore(score)
    this.tls[1].innerHTML = "Best: " + this.best
  }

  this.setscore = function(n, score, m) {
    this.sc = [n, score, m]
    this.msg.innerHTML = this.sc[2] + this.sc[0];
    this.msg.style.visibility = "visible"
    setTimeout(ldoscore, 60)
  }

  this.upview = function(score, k) {
    var r = this.tls[0].innerHTML 
    var n = parseInt(r.substring(7))
    var m = 'You got a full line  '
    if (k > 1) {
      var m = 'Cool! You completed double lines '
      if (k == 3)
        m = 'Beatifull! You got the triple lines '
      else if (k > 3)
        m = 'Superio! You made multiple lines '
    }
    if (k) {
      this.setscore(n, score, m)
      if (!!window.chrome && !!window.chrome.webstore)
        this.showscore(score)  
    }
    else
      this.showscore(score)
  }

  this.disp = function() {
    this.msg.style.visibility = "hidden"
  }  

  this.mesg = function(s, tm) {
    if (tm == undefined) tm = 3000
    this.msg.innerHTML = s;
    this.msg.style.visibility = "visible"
    setTimeout(this.disp, tm + s.length*20)
  }

  this.help = function() {
    this.mesg("The goal of the game is to get as most score as you can through drag and drop the sample pattern to the board space, when the the line (horizontal or sloped) be filled full, its spaces are freed and get more score. To consider the best space you are going to fill in and have a fun!  ")
  }    

  this.comments = [
     "Are you kidding?",
     "It is joke!",
     "You need improve your skill.",
     "Hope next time you can do better.",
     "You are still under normal level.",
     "You are normal level now.",
     "Good job you done!",
     "Excelent! Continue..",
     "You are ubove normal level.",
     "You are smart!",
     "You can show your score to your friend.",
     "Unbelivable!",
     "Congratulation! You are belong the best."
  ]

  this.result = function () {
    var r = this.tls[0].innerHTML
    var n = parseInt(r.substring(7))
    var k = Math.round(n / 2000)
    if (k > 4) {
      k = Math.round(n / 5000) + 4
      if (k >= this.comments.length)
        k = this.comments.length - 1 
    } 
    this.mesg("No place to put in, you get score: " + n + " " + this.comments[k] + "     Try again?")
    this.mt.hexagon.showboard()
  }  

  this.init = function() {
    this.mt.hexagon.init()
    this.showscore(0)
    this.mt.dispall()
    this.mt.dispone(1)
    this.mt.dispone(2)
    this.mt.dispone(3)
    this.mt.setcoord()
  }  

  _mb = this;
  this.mt = new TetrisObj(e0, e1, e2, e3, lupview, lresult);
  this.tls = document.getElementsByTagName("TH");
  this.best = this.savescore(0);
  this.mt.setname('_mb.mt');
  this.msg = document.getElementById(msg);
  this.init();
}

/* call back functions */
var _mb

function lupview (score, k) {
   _mb.upview(score, k)
}

function lresult() {
  _mb.result()
}

function ldoscore() {
  _mb.doscore()
}

