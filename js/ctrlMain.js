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
        if(confirm('Êtes vous sûr(e) de vouloir supprimer cette date?'))
        {
            $scope.astreintes.splice($scope.astreintes.indexOf(ast), 1);
        }
    }

    //Reset all
    $scope.reset = function(){
        if(confirm('Êtes vous sûr(e) de vouloir TOUT réinitialiser?'))
        {
            $scope.astreintes = [];
        }
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

        $scope.durationSemaine = moment.duration();
        $scope.durationWeekend = moment.duration();

        $scope.durationAppelJour = moment.duration();
        $scope.durationAppelFerie = moment.duration();
        $scope.durationAppelNuit = moment.duration();

        $scope.astreintes.forEach(function(ast){
            var start, end;
            var date = moment(ast.date).seconds(0);
            var nighttime = moment(date).hours(21).minutes(0);
            var day = date.day();

            var isSunday = day==0;
            var isFerie = ast.ferie;
            var isWeekend = day==6 || isSunday;

            if(isWeekend)
            {
                start = moment(date).hours(7).minutes(30);
                end = moment(start).add(24, 'hours');
                $scope.nbJourWeekend++;
                $scope.durationWeekend.add(moment.duration({hours: 24}))
            }
            else if(isFerie)
            {
                start = moment(date).hours(17).minutes(50);
                end = moment(start).add({hours: 13, minutes: 40});
                $scope.nbJourWeekend++;
                $scope.durationWeekend.add(moment.duration({hours: 13, minutes: 40}))
            }
            else
            {
                start = moment(date).hours(17).minutes(50);
                end = moment(start).add({hours: 13, minutes: 40});
                $scope.nbJourSemaine++;
                $scope.durationSemaine.add(moment.duration({hours: 13, minutes: 40}))
            }

            ast.appels.forEach(function(appel){
                var from = moment(appel.from);
                var to = moment(appel.to);

                from.year(date.year()).month(date.month()).date(date.date());
                to.year(date.year()).month(date.month()).date(date.date());

                //If from under start
                if(from.diff(start)<0)
                {
                    from.add(1, 'day');
                }

                if(to.diff(start)<0)
                {
                    //If we changed day during appel
                    to.add(1, 'day');
                }

                //Validation
                if(start.diff(from)>0)
                {
                    appel.error = "Horaire de début antérieur à l'astreinte";
                }
                else if(to.diff(end)>0)
                {
                    appel.error = "Horaire de fin postérieur à l'astreinte";
                }
                else if(to.diff(from)<0)
                {
                    appel.error = "Horaire de début supérieur à l'horaire de fin";
                }
                else
                {
                    appel.error = null;
                }

                var beforeNight = Math.abs(from.diff(nighttime) < 0 ? from.diff(moment.min(nighttime, to)):0);
                var duringNight = Math.abs(to.diff(nighttime) < 0 ? moment.min(to, nighttime).diff(to):moment.max(nighttime, from).diff(to));

                console.log(start.format(), end.format(), from.format());

                console.log('BEFORE', from.format(), nighttime.format(), beforeNight, moment.duration(beforeNight).humanize(), from.diff(nighttime));
                console.log('DURING', to.format(), nighttime.format(), duringNight, moment.duration(duringNight).humanize(), to.diff(nighttime));
                console.log('----')


                if(appel.error)
                {
                    return;
                }

                $scope.durationAppelNuit.add(duringNight);
                if(isSunday || isFerie)
                {
                    $scope.durationAppelFerie.add(beforeNight);
                }
                else
                {
                    $scope.durationAppelJour.add(beforeNight);
                }

            })
        });

    }, true)
}