function ctrlMain($scope, localStorageService){

    //Bind local storage
    localStorageService.bind($scope, 'astreintes', []);

    //Restore dates
    $scope.astreintes.forEach(function(a){
        if(a.date)
        {
            a.date = new Date(a.date);
        }
        a.appels.forEach(function(p){
            if(p.from)
            {
                p.from = new Date(p.from);
            }
            if(p.to)
            {
                p.to = new Date(p.to);
            }
        })
    })

    //Add astreinte
    $scope.addAstreinte = function(){
        $scope.astreintes.push({
            date: new Date,
            appels: []
        });
    }

    //Remove astreinte
    $scope.removeAstreinte = function(ast){
        $scope.astreintes.splice($scope.astreintes.indexOf(ast), 1);
    }

    //Reset all
    $scope.reset = function(){
        $scope.astreintes = [];
    }

    //Add Appel
    $scope.addAppel = function(ast){
        ast.appels.push({
            from: new Date('1970-01-01T00:00:00.000Z'),
            to: new Date('1970-01-01T00:00:00.000Z')
        });
    }

    //Remove Appel
    $scope.removeAppel = function(ast, appel){
        ast.appels.splice(ast.appels.indexOf(appel), 1);
    }

    $scope.nombreJourSemaine = function(){
        return Math.random();
    }

    //Update storage when astreinte changes (deep watch)
    $scope.$watch(function(){return $scope.astreintes}, function(){
        localStorageService.set('astreintes', $scope.astreintes);

        //Compute
        $scope.nbJourSemaine = 0;
        $scope.nbJourWeekend = 0;
        $scope.astreintes.forEach(function(ast){
            var date = moment(ast.date);
            var day = date.day();
            var isSunday = day==0;
            var isWeekend = day==0 || day==6;

            $scope.nbJourSemaine+= isWeekend ? 0:1;
            $scope.nbJourWeekend+= isWeekend ? 1:0;

            ast.appels.forEach(function(appel){
                var from = moment(appel.from);
                var to = moment(appel.to);
                from.year(date.year()).month(date.month()).day(date.day());
                to.year(date.year()).month(date.month()).day(date.day());
                if(from.diff(to)>0)
                {
                    //If we changed day during appel
                    to.add(1, 'day');
                }
                console.log(from.format(), to.format());
            })
        });

    }, true)
}