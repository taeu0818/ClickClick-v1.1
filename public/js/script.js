class App {
    constructor() {
        this.page = 0;
        this.frame = ["단색_1","크리스마스_1","겨울_1","행운_1","단색_2","크리스마스_2","겨울_2","행운_2"];
        this.photoCanvas = $('#photoCanvas')[0];
        this.photoCtx = this.photoCanvas.getContext('2d');

        this.frameCanvas = $('<canvas width="1250" height="3750">')[0];
        this.frameCtx = this.frameCanvas.getContext('2d');

        this.data = {frame : 0};
        this.photoImage = [];

        this.init();
        this.events();
        this.photo();
    }

    async init(){
        await this.pageView();
        this.frameView();
    }

    photo(){
        this.photoCount = 0;
        const video = $('#photoVideo')[0];
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    width: {ideal: 440},
                    height: {ideal: 300},
                }
            })
                .then(async (stream) => {
                    video.srcObject = stream;
                    const draw = (async () => {
                            this.photoCtx.save();
                            this.photoCtx.translate(1100, 0);
                            this.photoCtx.scale(-1, 1);
                            this.photoCtx.drawImage(video, 0, 0, 1100, 750);
                            this.photoCtx.restore();
                            requestAnimationFrame(draw);
                       }).bind(this);
                    await draw();
                })
        }
    }

    timer() {
        const timer = $('.second');
        let num = 7;
        const interval = setInterval(async() => {
            if (this.photoCount === 4) {
                clearInterval(interval);
                this.page += 1;
                await this.pageView();
                this.frameCtx.drawImage(await createImage(`./resource/frame/${this.frame[this.data.frame]}.png`), 0,0,1250,3750);
                $(`<a href="${this.frameCanvas.toDataURL()}" download="${this.data.count}장.png">`)[0].click();
            }
            timer.text(num + 's');
            num--;
            if (num < 0) {
                this.photoCount += 1;
                $('.page').text(this.photoCount + '/4');
                num = 7;
                $('.motion').animate({
                    opacity: '0.7'
                }, 50, function () {
                    $(this).animate({
                        opacity: '0'
                    }, 100);
                });
                const x = 75;
                const y = (this.photoCount - 1) * 800 + 75;
                this.frameCtx.drawImage(await createImage(this.photoCanvas.toDataURL()) , x,y ,1100,750);
            }
        }, 1000)
    }


    frameView(){
        const html = this.frame.map((f , i) => `
            <div class="color ${!i ? 'active' : ''}" style="background: url('./resource/frame-icon/${f}.png') center/cover"></div>
        `).join('');
        $('.colors').html(html);
    }

    frameClick({target}){
        const num = $(target).index();
        $('.color').removeClass('active').eq(num).addClass('active');
        this.data.frame = num;
        $('.frame-preview').attr('src', `./resource/frame-preview/${this.frame[num]}.png`)
    }


    async pageView(){
        $('[data-page]').addClass('d-none').eq(this.page).removeClass('d-none');
        if(this.page === 2) {
            setTimeout(() => {
                $('.wait-bg').css('z-index' , '-1');
                this.timer();
            },2000)
        }
        if(this.page === 3){
            this.end();
        }
    }

    end(){
        const $target =$('.end');
        let num = 9;
        const interval = setInterval(() => {
            if(num === 0){
                clearInterval(interval);
                location.reload();
            }
            $target.text(`${num}초 후 자동으로 종료됩니다.`);
            num--;
        },1000)
    }

    countClick({target}){
        this.data.count = Number($(target).attr('data-count'));
        $('.option-bg .count').removeClass('active').eq($(target).index()).addClass('active');
    }

    async nextPrev({target}){
        const type = $(target).attr('data-nextPrev');
        const next = type === 'next';
        if((next && this.page === 1) && (this.data?.frame === undefined || this.data?.count === undefined)){
            return alert('모두 선택해주세요.');
        }
        this.page += next ? 1 : -1;
        await this.pageView();
    }

    events(){
        $(document)
            .on('keydown' , ((e) => e.key === 'F5' ? e.preventDefault() : null))
            .on('click' , '.option-bg .count' , this.countClick.bind(this))
            .on('click' , '[data-nextPrev]' , this.nextPrev.bind(this))
            .on('click' , '.color' , this.frameClick.bind(this))
    }

}

$(() => new App());
